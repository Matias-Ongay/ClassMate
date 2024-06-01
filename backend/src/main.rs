use actix_web::{web, HttpResponse, Responder, App, HttpServer};
use actix_cors::Cors;
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
    status: String,
}

#[derive(Debug, Deserialize)]
struct UpdateTaskStatusRequest {
    task_id: i32,
    new_status: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Subject {
    id: i32,
    name: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ExamDate {
    id: i32,
    subject_id: i32,
    date: String, // Puedes cambiar el tipo según tus necesidades (por ejemplo, a un tipo de fecha)
}

#[derive(Debug, Serialize, Deserialize)]
struct Note {
    id: i32,
    subject_id: i32,
    content: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct FileLink {
    id: i32,
    subject_id: i32,
    url: String,
}

#[derive(Debug, Deserialize)]
struct AddSubjectRequest {
    name: String,
}

#[derive(Debug, Deserialize)]
struct AddExamDateRequest {
    subject_id: i32,
    date: String,
}

#[derive(Debug, Deserialize)]
struct AddNoteRequest {
    subject_id: i32,
    content: String,
}

#[derive(Debug, Deserialize)]
struct AddFileLinkRequest {
    subject_id: i32,
    url: String,
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
    let status = &add_task_info.status;

    match insert_task(&db_conn, title, status) {
        Ok(_) => HttpResponse::Ok().body("Tarea agregada exitosamente"),
        Err(_) => HttpResponse::InternalServerError().body("Error al agregar la tarea"),
    }
}
async fn delete_task(
    task_id: web::Path<i32>,
    db_conn: web::Data<Arc<Mutex<Connection>>>,
) -> impl Responder {
    let id = task_id.into_inner();

    match remove_task(&db_conn, id) {
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
        "Pendiente" | "En ejecucion" | "Tarea finalizada" => {
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
    status: &str,
) -> Result<()> {
    let mut conn = db_conn.lock().unwrap();
    conn.execute(
        "INSERT INTO tasks (title, status) VALUES (?1, ?2)",
        &[title, status],
    )?;
    Ok(())
}

async fn add_subject(
    add_subject_info: web::Json<AddSubjectRequest>,
    db_conn: web::Data<Arc<Mutex<Connection>>>,
) -> impl Responder {
    let name = &add_subject_info.name;

    match insert_subject(&db_conn, name) {
        Ok(_) => HttpResponse::Ok().body("Materia agregada exitosamente"),
        Err(_) => HttpResponse::InternalServerError().body("Error al agregar la materia"),
    }
}

async fn delete_subject(
    subject_id: web::Path<i32>,
    db_conn: web::Data<Arc<Mutex<Connection>>>,
) -> impl Responder {
    let id = subject_id.into_inner();

    match remove_subject(&db_conn, id) {
        Ok(_) => HttpResponse::Ok().body("Materia eliminada exitosamente"),
        Err(_) => HttpResponse::InternalServerError().body("Error al eliminar la materia"),
    }
}

fn insert_subject(
    db_conn: &web::Data<Arc<Mutex<Connection>>>,
    name: &str,
) -> Result<()> {
    let mut conn = db_conn.lock().unwrap();
    conn.execute(
        "INSERT INTO subjects (name) VALUES (?1)",
        &[name],
    )?;
    Ok(())
}

fn remove_subject(
    db_conn: &web::Data<Arc<Mutex<Connection>>>,
    subject_id: i32,
) -> Result<()> {
    let mut conn = db_conn.lock().unwrap();
    conn.execute(
        "DELETE FROM subjects WHERE id = ?1",
        &[&subject_id.to_string()],
    )?;
    Ok(())
}

async fn add_exam_date(
    add_exam_date_info: web::Json<AddExamDateRequest>,
    db_conn: web::Data<Arc<Mutex<Connection>>>,
) -> impl Responder {
    let subject_id = add_exam_date_info.subject_id;
    let date = &add_exam_date_info.date;

    match insert_exam_date(&db_conn, subject_id, date) {
        Ok(_) => HttpResponse::Ok().body("Fecha de examen agregada exitosamente"),
        Err(_) => HttpResponse::InternalServerError().body("Error al agregar la fecha de examen"),
    }
}

fn insert_exam_date(
    db_conn: &web::Data<Arc<Mutex<Connection>>>,
    subject_id: i32,
    date: &str,
) -> Result<()> {
    let mut conn = db_conn.lock().unwrap();
    conn.execute(
        "INSERT INTO exam_dates (subject_id, date) VALUES (?1, ?2)",
        &[&subject_id.to_string(), date],
    )?;
    Ok(())
}

async fn add_note(
    add_note_info: web::Json<AddNoteRequest>,
    db_conn: web::Data<Arc<Mutex<Connection>>>,
) -> impl Responder {
    let subject_id = add_note_info.subject_id;
    let content = &add_note_info.content;

    match insert_note(&db_conn, subject_id, content) {
        Ok(_) => HttpResponse::Ok().body("Nota agregada exitosamente"),
        Err(_) => HttpResponse::InternalServerError().body("Error al agregar la nota"),
    }
}

fn insert_note(
    db_conn: &web::Data<Arc<Mutex<Connection>>>,
    subject_id: i32,
    content: &str,
) -> Result<()> {
    let mut conn = db_conn.lock().unwrap();
    conn.execute(
        "INSERT INTO notes (subject_id, content) VALUES (?1, ?2)",
        &[&subject_id.to_string(), content],
    )?;
    Ok(())
}

async fn add_file_link(
    add_file_link_info: web::Json<AddFileLinkRequest>,
    db_conn: web::Data<Arc<Mutex<Connection>>>,
) -> impl Responder {
    let subject_id = add_file_link_info.subject_id;
    let url = &add_file_link_info.url;

    match insert_file_link(&db_conn, subject_id, url) {
        Ok(_) => HttpResponse::Ok().body("Enlace de archivo agregado exitosamente"),
        Err(_) => HttpResponse::InternalServerError().body("Error al agregar el enlace de archivo"),
    }
}

fn insert_file_link(
    db_conn: &web::Data<Arc<Mutex<Connection>>>,
    subject_id: i32,
    url: &str,
) -> Result<()> {
    let mut conn = db_conn.lock().unwrap();
    conn.execute(
        "INSERT INTO file_links (subject_id, url) VALUES (?1, ?2)",
        &[&subject_id.to_string(), url],
    )?;
    Ok(())
}
async fn get_tasks(db_conn: web::Data<Arc<Mutex<Connection>>>) -> impl Responder {
    let conn = db_conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, title, status FROM tasks").unwrap();
    let task_iter = stmt.query_map([], |row| {
        Ok(Task {
            id: row.get(0)?,
            title: row.get(1)?,
            status: row.get(2)?,
        })
    }).unwrap();

    let tasks: Vec<Task> = task_iter.map(|task| task.unwrap()).collect();

    HttpResponse::Ok().json(tasks)
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

    // Crear tabla de materias si no existe
    {
        let mut conn = db_conn.lock().unwrap();
        conn.execute(
            "CREATE TABLE IF NOT EXISTS subjects (
                 id INTEGER PRIMARY KEY,
                 name TEXT NOT NULL
             )",
            [],
        )
        .expect("Failed to create subjects table.");
    }

    // Crear tabla de fechas de exámenes si no existe
    {
        let mut conn = db_conn.lock().unwrap();
        conn.execute(
            "CREATE TABLE IF NOT EXISTS exam_dates (
                 id INTEGER PRIMARY KEY,
                 subject_id INTEGER NOT NULL,
                 date TEXT NOT NULL,
                 FOREIGN KEY (subject_id) REFERENCES subjects(id)
             )",
            [],
        )
        .expect("Failed to create exam_dates table.");
    }

    // Crear tabla de notas si no existe
    {
        let mut conn = db_conn.lock().unwrap();
        conn.execute(
            "CREATE TABLE IF NOT EXISTS notes (
                 id INTEGER PRIMARY KEY,
                 subject_id INTEGER NOT NULL,
                 content TEXT NOT NULL,
                 FOREIGN KEY (subject_id) REFERENCES subjects(id)
             )",
            [],
        )
        .expect("Failed to create notes table.");
    }

    // Crear tabla de enlaces de archivos si no existe
    {
        let mut conn = db_conn.lock().unwrap();
        conn.execute(
            "CREATE TABLE IF NOT EXISTS file_links (
                 id INTEGER PRIMARY KEY,
                 subject_id INTEGER NOT NULL,
                 url TEXT NOT NULL,
                 FOREIGN KEY (subject_id) REFERENCES subjects(id)
             )",
            [],
        )
        .expect("Failed to create file_links table.");
    }

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors) // Añadir el middleware CORS aquí
            .app_data(web::Data::new(db_conn.clone()))
            .service(web::resource("/register").route(web::post().to(register)))
            .service(web::resource("/login").route(web::post().to(login)))
            .service(web::resource("/add_task").route(web::post().to(add_task)))
            .service(web::resource("/update_task_status").route(web::post().to(update_task_status)))
            .service(web::resource("/delete_task/{task_id}").route(web::delete().to(delete_task)))
            .service(web::resource("/get_tasks").route(web::get().to(get_tasks)))
            .service(web::resource("/add_subject").route(web::post().to(add_subject)))
            .service(web::resource("/delete_subject/{subject_id}").route(web::delete().to(delete_subject)))
            .service(web::resource("/add_exam_date").route(web::post().to(add_exam_date)))
            .service(web::resource("/add_note").route(web::post().to(add_note)))
            .service(web::resource("/add_file_link").route(web::post().to(add_file_link)))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
