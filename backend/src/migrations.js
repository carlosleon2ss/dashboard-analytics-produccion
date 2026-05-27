const pool = require('./db')

async function runMigrations() {
  try {
    // Tabla de usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(150) UNIQUE NOT NULL,
        password    VARCHAR(255) NOT NULL,
        role        VARCHAR(20) DEFAULT 'viewer',
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      )
    `)

    // Tabla de eventos (reemplaza los datos en memoria)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id          SERIAL PRIMARY KEY,
        event_id    VARCHAR(20) UNIQUE NOT NULL,
        product     VARCHAR(100),
        amount      DECIMAL(10,2),
        status      VARCHAR(20),
        source      VARCHAR(50),
        region      VARCHAR(50),
        country     VARCHAR(50),
        created_at  TIMESTAMP DEFAULT NOW()
      )
    `)

    // Tabla de métricas históricas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS metrics_history (
        id              SERIAL PRIMARY KEY,
        cpu             DECIMAL(5,2),
        memory          DECIMAL(5,2),
        network         DECIMAL(5,2),
        active_users    INTEGER,
        revenue         DECIMAL(12,2),
        orders          INTEGER,
        conversion_rate DECIMAL(5,2),
        recorded_at     TIMESTAMP DEFAULT NOW()
      )
    `)

    console.log('✅ Tablas creadas correctamente')

    // Crea el usuario admin por defecto si no existe
    const bcrypt = require('bcryptjs')
    const hash   = await bcrypt.hash('admin1234', 10)

    await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['Administrador', 'admin@dashboard.com', hash, 'admin'])

    console.log('Usuario admin creado: admin@dashboard.com / admin1234')

  } catch (err) {
    console.error('Error en migraciones:', err.message)
  }
}

module.exports = { runMigrations }