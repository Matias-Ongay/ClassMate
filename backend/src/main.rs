use actix_web::{web, HttpResponse, Responder};
use serde::{Serialize, Deserialize};
use bcrypt::{hash, verify, DEFAULT_COST};
use rusqlite::{Connection, Result};
use std::sync::{Arc, Mutex};

#[derive(Debug, Serialize, Deserialize)]
struct User {
    id: i32,
    username: String,
    password_hash: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Task {
    id: i32,
    title: String,
    status: String, // Puede ser "Pendiente", "En ejecución" o "Terminada"
}

#[derive(Debug, Deserialize)]
struct RegisterRequest {
    username: String,
    password: String,
}

#[derive(Debug, Deserialize)]
struct LoginRequest {
    username: String,
    password: String,
}

#[derive(Debug, Deserialize)]
struct AddTaskRequest {
    title: String,
}

#[derive(Debug, Deserialize)]
struct UpdateTaskStatusRequest {
    task_id: i32,
    new_status: String,
}
#[derive(Debug, Deserialize)]
struct TaskIdRequest {
    task_id: i32,
}

async fn register(
    register_info: web::Json<RegisterRequest>,
    db_conn: web::Data<Arc<Mutex<Connection>>>,
) -> impl Responder {
    let username = &register_info.username;
    let password = &register_info.password;

    let password_hash = match hash(password, DEFAULT_COST) {
        Ok(hash) => hash,
        Err(_) => return HttpResponse::InternalServerError().body("Error al hashear la contraseña"),
    };

    match insert_user(&db_conn, username, &password_hash) {
        Ok(_) => HttpResponse::Ok().body("Usuario registrado exitosamente"),
        Err(_) => HttpResponse::InternalServerError().body("Error al registrar el usuario"),
    }
}

async fn login(
    login_info: web::Json<LoginRequest>,
    db_conn: web::Data<Arc<Mutex<Connection>>>,
) -> impl Responder {
    let username = &login_info.username;
    let password = &login_info.password;

    match find_user(&db_conn, username) {
        Ok(user) => {
            if verify(password, &user.password_hash).unwrap_or(false) {
                HttpResponse::Ok().body("Inicio de sesión exitoso")
            } else {
                HttpResponse::Unauthorized().body("Credenciales inválidas")
            }
        }
        Err(_) => HttpResponse::Unauthorized().body("Credenciales inválidas"),
    }
}

async fn add_task(
    add_task_info: web::Json<AddTaskRequest>,
    db_conn: web::Data<Arc<Mutex<Connection>>>,
) -> impl Responder {
    let title = &add_task_info.title;

    match insert_task(&db_conn, title) {
        Ok(_) => HttpResponse::Ok().body("Tarea agregada exitosamente"),
        Err(_) => HttpResponse::InternalServerError().body("Error al agregar la tarea"),
    }
}
async fn delete_task(
    delete_info: web::Json<TaskIdRequest>,
    db_conn: web::Data<Arc<Mutex<Connection>>>,
) -> impl Responder {
    let task_id = delete_info.task_id;

    match remove_task(&db_conn, task_id) {
        Ok(_) => HttpResponse::Ok().body("Tarea eliminada exitosamente"),
        Err(_) => HttpResponse::InternalServerError().body("Error al eliminar la tarea"),
    }
}
fn remove_task(
    db_conn: &web::Data<Arc<Mutex<Connection>>>,
    task_id: i32,
) -> Result<()> {
    let mut conn = db_conn.lock().unwrap();
    conn.execute(
        "DELETE FROM tasks WHERE id = ?1",
        &[&task_id.to_string()],
    )?;
    Ok(())
}

async fn update_task_status(
    update_info: web::Json<UpdateTaskStatusRequest>,
    db_conn: web::Data<Arc<Mutex<Connection>>>,
) -> impl Responder {
    let task_id = update_info.task_id;
    let new_status = &update_info.new_status;

    match new_status.as_str() {
        "Pendiente" | "En ejecución" | "Tarea finalizada" => {
            match modify_task_status(&db_conn, task_id, new_status) {
                Ok(_) => HttpResponse::Ok().body("Estado de la tarea actualizado exitosamente"),
                Err(_) => HttpResponse::InternalServerError().body("Error al actualizar el estado de la tarea"),
            }
        }
        _ => HttpResponse::BadRequest().body("Estado de tarea no válido"),
    }
}
fn modify_task_status(
    db_conn: &web::Data<Arc<Mutex<Connection>>>,
    task_id: i32,
    new_status: &str,
) -> Result<()> {
    let mut conn = db_conn.lock().unwrap();
    conn.execute(
        "UPDATE tasks SET status = ?1 WHERE id = ?2",
        &[new_status, &task_id.to_string()],
    )?;
    Ok(())
}

fn insert_user(
    db_conn: &web::Data<Arc<Mutex<Connection>>>,
    username: &str,
    password_hash: &str,
) -> Result<()> {
    let mut conn = db_conn.lock().unwrap();
    conn.execute(
        "INSERT INTO users (username, password_hash) VALUES (?1, ?2)",
        &[username, password_hash],
    )?;
    Ok(())
}

fn find_user(
    db_conn: &web::Data<Arc<Mutex<Connection>>>,
    username: &str,
) -> Result<User> {
    let mut conn = db_conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, username, password_hash FROM users WHERE username = ?1",
    )?;
    let user_row = stmt.query_row(&[username], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            password_hash: row.get(2)?,
        })
    })?;
    Ok(user_row)
}

fn insert_task(
    db_conn: &web::Data<Arc<Mutex<Connection>>>,
    title: &str,
) -> Result<()> {
    let mut conn = db_conn.lock().unwrap();
    conn.execute(
        "INSERT INTO tasks (title, status) VALUES (?1, 'Pendiente')",
        &[title],
    )?;
    Ok(())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let db_path = "classmate.db";
    let db_conn = Arc::new(Mutex::new(Connection::open(db_path).expect("Failed to connect to database.")));

    // Crear tabla de usuarios si no existe
    {
        let mut conn = db_conn.lock().unwrap();
        conn.execute(
            "CREATE TABLE IF NOT EXISTS users (
                 id INTEGER PRIMARY KEY,
                 username TEXT NOT NULL UNIQUE,
                 password_hash TEXT NOT NULL
             )",
            [],
        )
        .expect("Failed to create users table.");
    }

    // Crear tabla de tareas si no existe
    {
        let mut conn = db_conn.lock().unwrap();
        conn.execute(
            "CREATE TABLE IF NOT EXISTS tasks (
                 id INTEGER PRIMARY KEY,
                 title TEXT NOT NULL,
                 status TEXT NOT NULL
             )",
            [],
        )
        .expect("Failed to create tasks table.");
    }

    actix_web::HttpServer::new(move || {
        actix_web::App::new()
            .app_data(web::Data::new(db_conn.clone()))
            .service(web::resource("/register").route(web::post().to(register)))
            .service(web::resource("/login").route(web::post().to(login)))
            .service(web::resource("/add_task").route(web::post().to(add_task)))
            .service(web::resource("/update_task_status").route(web::post().to(update_task_status)))
            .service(web::resource("/delete_task").route(web::post().to(delete_task)))

    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
