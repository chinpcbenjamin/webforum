package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var database *sql.DB

func Initialise_database() {
	var err error
	database, err = sql.Open("sqlite3", "./users.db")

	// if there is an error opening the database
	if err != nil {
		log.Fatal(err)
	}

	createTable := `CREATE TABLE IF NOT EXISTS users (
		username TEXT PRIMARY KEY NOT NULL,
		password TEXT NOT NULL
	);`

	if _, err := database.Exec(createTable); err != nil {
		log.Fatal(err)
	}
}

func Close_database() {
	if database != nil {
		database.Close()
	}
}

func Get_Database() *sql.DB {
	return database
}
