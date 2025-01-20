package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwt_key = []byte(os.Getenv("JWT_SECRET"))

func CreateToken(username string) (string, error) {
	// when user creates account or signs in, issue a jwt token
	// store time in unix to support comparisions

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"issuer":  "benjamin's forum",
		"subject": username,
		"expiry":  time.Now().Add(24 * time.Hour).Unix(),
	})

	return token.SignedString(jwt_key)
}

func VerifyToken(jwt_token string) bool {
	token, err := jwt.Parse(jwt_token, func(token *jwt.Token) (interface{}, error) {
		return jwt_key, nil
	})

	if err != nil || !token.Valid {
		return false
	}

	claims, _ := token.Claims.(jwt.MapClaims)
	expiry, _ := claims["expiry"].(float64)
	expiryInt := int64(expiry)

	return time.Now().Unix() < expiryInt
}

func RetrieveUserFromToken(jwt_token string) string {
	token, _ := jwt.Parse(jwt_token, func(token *jwt.Token) (interface{}, error) {
		return jwt_key, nil
	})

	claims, _ := token.Claims.(jwt.MapClaims)
	user, _ := claims["subject"].(string)

	return user
}
