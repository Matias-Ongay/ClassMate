use rusqlite::{Connection, Result};

fn main() -> Result<()> {
    // Establecer la conexión con la base de datos
    let conn = Connection::open("C:/Users/matia/OneDrive/Escritorio/FACU/3ro/Automatas y lenguajes/ClassMateDB.db")?;

    // Crear la tabla de usuarios si no existe
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
             id INTEGER PRIMARY KEY,
             username TEXT NOT NULL UNIQUE,
             password TEXT NOT NULL
         )",
        [],
    )?;

    println!("Conexión establecida correctamente con la base de datos.");

    
    Ok(())
}
