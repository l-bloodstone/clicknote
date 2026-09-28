package router

import (
	"github.com/gin-gonic/gin"
)

var router *gin.Engine

func GetMainRouter() *gin.Engine {
	if router != nil {
		return router
	}
	gin.SetMode(gin.ReleaseMode)
	router = gin.New()
	return router
}
