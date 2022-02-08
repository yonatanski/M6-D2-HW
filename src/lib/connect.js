import pg from "pg"

// get pool from pg package
const { Pool } = pg

// initialize pool class and assign to variable
const pool = new Pool()

export default pool
