package main

import (
	"flag"
	"fmt"
	"strconv"

	"server/dab"
	"server/router"
)

func main() {
	// command-line flag for setting a static directory for the client(browser)
	staticDir := flag.String("static-dir", "../public/", "Relative path to the static dir",)
	port := flag.Int("port", 2233, "set Port")
	if (*port > 65535) {
		panic("Cannot use port number more than 65535")
	}
	flag.Parse()

	// getting router from a single main router
	app := router.GetMainRouter()
	app.Static("/", *staticDir)

	// NOTE: migrate the table
	db := dab.GetDB()
	defer db.Close()
	if _, err := db.Exec("create table if not exists note (noteId text primary key, passhash text, salt text, data text)"); err != nil {
		panic(err)
	}
	
	fmt.Println("Server is Running at: http://localhost:" + strconv.Itoa(*port))
	app.Run(":" + strconv.Itoa(*port))
}
