package router

import (
	"server/controllers"
)

var api = GetMainRouter().Group("/api")

func init() {
	api.POST("/get_salt", controllers.GetSalt)
	api.POST("/get_note", controllers.GetNote)
	api.POST("/create_note", controllers.CreateNote)
	api.PUT("/save_note", controllers.SaveNote)
}
