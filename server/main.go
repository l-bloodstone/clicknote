package main

import (
	"flag"
	"fmt"
	"strconv"

	"server/dab"
	"server/router"
	"server/controllers"

	"github.com/gin-gonic/gin"
)



func main() {
	// command-line flag for setting a static directory for the client(browser)
	staticDir := flag.String("static-dir", "../public/", "Relative path to the static dir",)
	port := flag.Int("port", 2233, "set Port")
	if (*port > 65535) {
		panic("Cannot use port number more than 65535")
	}
	flag.Parse()

	// setting gin mode to release mode and creating a new server
	gin.SetMode(gin.ReleaseMode)
	app := router.GetRouter()
	app.Static("/", *staticDir)

	// NOTE: migrate the table
	db := dab.GetDB()
	defer db.Close()
	if _, err := db.Exec("create table if not exists note (noteId text primary key, passhash text, salt text, data text)"); err != nil {
		panic(err)
	}

	app.POST("/get_salt", controllers.GetSalt)
	app.POST("/get_note", controllers.GetNote)
	app.POST("/create_note", controllers.CreateNote)
	app.PUT("/save_note", controllers.SaveNote)

	fmt.Println("Server is Running at: http://localhost:" + strconv.Itoa(*port))
	app.Run(":" + strconv.Itoa(*port))
}
