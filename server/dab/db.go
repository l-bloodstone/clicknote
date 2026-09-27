package dab

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
)


var db *sql.DB

func GetDB() *sql.DB {
	if db != nil {
		return db
	}
	// seeting the database
	// NOTE: I chose sqlite3 for its simplicity it can be any sql database
	//		 but you have to set the database in the next line
	d, err := sql.Open("sqlite3", "./notes.db")
	if err != nil {
		panic(err)
	}
	db = d
	return db
}
