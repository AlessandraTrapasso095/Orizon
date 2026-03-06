-- struttura MySQL 

-- crea il database solo se non esiste gia
CREATE DATABASE IF NOT EXISTS orizon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- mi serve per selezionare il database su cui applicare tutte le tabelle
USE orizon;

-- crea la tabella prodotti 
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_products_name (name)
) ENGINE=InnoDB;

-- tabella utenti 
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- registra gli ordini e permette filtro per data inserimento
CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_orders_created_at (created_at)
) ENGINE=InnoDB;

-- mi serve per collegare ordini e prodotti
CREATE TABLE IF NOT EXISTS order_products (
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (order_id, product_id),
  KEY idx_order_products_product_id (product_id),
  CONSTRAINT fk_order_products_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_products_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- mi serve per collegare ordini e utenti 
CREATE TABLE IF NOT EXISTS order_users (
  order_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (order_id, user_id),
  KEY idx_order_users_user_id (user_id),
  CONSTRAINT fk_order_users_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_users_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;
