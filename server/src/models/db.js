import { Pool } from 'pg'

export default {
    pool: new Pool({
        database: "postgres",
        user: "postgres",
    })
}
