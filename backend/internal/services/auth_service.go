package services

import (
	"database/sql"
	"errors"
	"time"

	"bi-a-management/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	db        *sql.DB
	jwtSecret string
}

func NewAuthService(db *sql.DB, jwtSecret string) *AuthService {
	return &AuthService{
		db:        db,
		jwtSecret: jwtSecret,
	}
}

func (s *AuthService) Login(username, password string) (*models.LoginResponse, error) {
	// Get user from database
	user, err := s.getUserByUsername(username)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Generate JWT token
	token, err := s.generateJWT(user)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		Token: token,
		User:  *user,
	}, nil
}

func (s *AuthService) getUserByUsername(username string) (*models.User, error) {
	user := &models.User{}
	query := `SELECT id, username, password_hash, role, created_at FROM users WHERE username = ?`
	
	err := s.db.QueryRow(query, username).Scan(
		&user.ID,
		&user.Username,
		&user.PasswordHash,
		&user.Role,
		&user.CreatedAt,
	)
	
	if err != nil {
		return nil, err
	}
	
	return user, nil
}

func (s *AuthService) generateJWT(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"userID":   user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(), // 24 hours
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}
