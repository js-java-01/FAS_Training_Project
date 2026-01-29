-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: learnmangement
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` binary(16) NOT NULL,
  `action` varchar(50) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `entity_id` binary(16) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `new_value` text,
  `old_value` text,
  `performed_at` datetime(6) DEFAULT NULL,
  `performed_by` binary(16) NOT NULL,
  `performed_by_email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` binary(16) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `display_order` int NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `required_permission` varchar(100) DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `menu_id` binary(16) NOT NULL,
  `parent_id` binary(16) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK6fwmu1a0d0hysfd3c00jxyl2c` (`menu_id`),
  KEY `FKkcxk88u5djnbobanga7hj14q6` (`parent_id`),
  CONSTRAINT `FK6fwmu1a0d0hysfd3c00jxyl2c` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`),
  CONSTRAINT `FKkcxk88u5djnbobanga7hj14q6` FOREIGN KEY (`parent_id`) REFERENCES `menu_items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (_binary ' §g\ÜPFÌº5Ÿ(°£«','2026-01-29 20:22:40.926385',NULL,1,'dashboard',_binary '',NULL,'Dashboard','2026-01-29 20:22:40.926385','/dashboard',_binary 'x\è`cˆI¹¹?O-­È¿+',NULL),(_binary 'n’Vj?2E×²û>ÀDgY','2026-01-29 20:22:40.937260',NULL,1,'people',_binary '','USER_READ','User Management','2026-01-29 20:22:40.937260','/users',_binary 'ý)\æ6š„Jê«‚WW±£¤·',NULL),(_binary 'ö„Ÿ2\ânKß¥¼}i\×\áaB','2026-01-29 20:22:40.943073',NULL,2,'security',_binary '','ROLE_READ','Role Management','2026-01-29 20:22:40.943073','/roles',_binary 'ý)\æ6š„Jê«‚WW±£¤·',NULL);
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menus` (
  `id` binary(16) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `display_order` int NOT NULL,
  `is_active` bit(1) NOT NULL,
  `name` varchar(100) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK1cqmcm5bt6ynbpadwn7a1dm1u` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (_binary 'x\è`cˆI¹¹?O-­È¿+','2026-01-29 20:22:40.920510','Primary navigation menu',1,_binary '','Main Menu','2026-01-29 20:22:40.920510'),(_binary 'ý)\æ6š„Jê«‚WW±£¤·','2026-01-29 20:22:40.932076','Administrative functions menu',2,_binary '','Administration','2026-01-29 20:22:40.932076');
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` binary(16) NOT NULL,
  `action` varchar(50) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `resource` varchar(50) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKpnvtwliis6p05pn6i3ndjrqt2` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (_binary 'NUÁ\ÔM+¯lb©HPŽ','UPDATE','2026-01-29 20:22:40.364085','Update existing roles','ROLE_UPDATE','ROLE','2026-01-29 20:22:40.364085'),(_binary 'B-o\ÆxG\ïª\ê\áo»EX','READ','2026-01-29 20:22:40.339690','View users','USER_READ','USER','2026-01-29 20:22:40.339690'),(_binary 'L,\ëpÛ‰@ \év‹.8\é','DELETE','2026-01-29 20:22:40.328666','Delete menu items','MENU_ITEM_DELETE','MENU_ITEM','2026-01-29 20:22:40.328666'),(_binary 'e:´q\äCó‚Î®2ñ™','DELETE','2026-01-29 20:22:40.348821','Delete users','USER_DELETE','USER','2026-01-29 20:22:40.348821'),(_binary 'gù‰9\îRMÔª\Ûw6Áþ\r1','UPDATE','2026-01-29 20:22:40.324668','Update existing menu items','MENU_ITEM_UPDATE','MENU_ITEM','2026-01-29 20:22:40.324668'),(_binary 'h7EAÀNg²‚˜.\ÚðG\Æ','READ','2026-01-29 20:22:40.361234','View roles','ROLE_READ','ROLE','2026-01-29 20:22:40.362243'),(_binary 'mY·/\ß}NU®\Ò2À_Ov','READ','2026-01-29 20:22:40.297743','View menus','MENU_READ','MENU','2026-01-29 20:22:40.297743'),(_binary 'n>\Û\ãBÀD“¯€ù°¾Œ','CREATE','2026-01-29 20:22:40.254420','Create new menus','MENU_CREATE','MENU','2026-01-29 20:22:40.254420'),(_binary 'x\\ò4L÷Ÿ.<:^\Íø','CREATE','2026-01-29 20:22:40.333794','Create new users','USER_CREATE','USER','2026-01-29 20:22:40.333794'),(_binary '}k»\ZrkO ž8”)…°M','ACTIVATE','2026-01-29 20:22:40.351901','Activate/deactivate users','USER_ACTIVATE','USER','2026-01-29 20:22:40.351901'),(_binary '€\Ù\Ó/\ëg@¢\î²È¦ó8œ','CREATE','2026-01-29 20:22:40.358189','Create new roles','ROLE_CREATE','ROLE','2026-01-29 20:22:40.358189'),(_binary 'ƒ¨F\É\×,Ejƒ7‰™`œ','READ','2026-01-29 20:22:40.317405','View menu items','MENU_ITEM_READ','MENU_ITEM','2026-01-29 20:22:40.317405'),(_binary ' \È‘¥¦Iÿ‹\ÞmA–#','ASSIGN','2026-01-29 20:22:40.374968','Assign roles to users','ROLE_ASSIGN','ROLE','2026-01-29 20:22:40.374968'),(_binary '£)ûn\ÇûI½›\Ås(3I\ç\Æ','DELETE','2026-01-29 20:22:40.364085','Delete roles','ROLE_DELETE','ROLE','2026-01-29 20:22:40.364085'),(_binary 'Úž£?E´‡7Ý´\ï†:\é','UPDATE','2026-01-29 20:22:40.297743','Update existing menus','MENU_UPDATE','MENU','2026-01-29 20:22:40.297743'),(_binary '\ëu\í&°\Â@ö’\Zþ\át','CREATE','2026-01-29 20:22:40.313398','Create new menu items','MENU_ITEM_CREATE','MENU_ITEM','2026-01-29 20:22:40.313398'),(_binary 'ôÏŠ¼r•H\rª· ¿”ÝŠ\Þ','DELETE','2026-01-29 20:22:40.307492','Delete menus','MENU_DELETE','MENU','2026-01-29 20:22:40.307492'),(_binary 'þd®X\ç…OØ‡={\â\Ã~Á','UPDATE','2026-01-29 20:22:40.343567','Update existing users','USER_UPDATE','USER','2026-01-29 20:22:40.343567');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role_id` binary(16) NOT NULL,
  `permission_id` binary(16) NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `FKegdk29eiy7mdtefy5c7eirr6e` (`permission_id`),
  CONSTRAINT `FKegdk29eiy7mdtefy5c7eirr6e` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`),
  CONSTRAINT `FKn5fotdgk8d1xvo8nav9uv3muc` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (_binary '¦Ni;º\\@-‡zfC\çNj',_binary 'NUÁ\ÔM+¯lb©HPŽ'),(_binary '=VïŠ¿Ij£ˆ|,S\ænú',_binary 'B-o\ÆxG\ïª\ê\áo»EX'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary 'B-o\ÆxG\ïª\ê\áo»EX'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary 'L,\ëpÛ‰@ \év‹.8\é'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary 'e:´q\äCó‚Î®2ñ™'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary 'gù‰9\îRMÔª\Ûw6Áþ\r1'),(_binary '=VïŠ¿Ij£ˆ|,S\ænú',_binary 'h7EAÀNg²‚˜.\ÚðG\Æ'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary 'h7EAÀNg²‚˜.\ÚðG\Æ'),(_binary '=VïŠ¿Ij£ˆ|,S\ænú',_binary 'mY·/\ß}NU®\Ò2À_Ov'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary 'mY·/\ß}NU®\Ò2À_Ov'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary 'n>\Û\ãBÀD“¯€ù°¾Œ'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary 'x\\ò4L÷Ÿ.<:^\Íø'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary '}k»\ZrkO ž8”)…°M'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary '€\Ù\Ó/\ëg@¢\î²È¦ó8œ'),(_binary '=VïŠ¿Ij£ˆ|,S\ænú',_binary 'ƒ¨F\É\×,Ejƒ7‰™`œ'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary 'ƒ¨F\É\×,Ejƒ7‰™`œ'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary ' \È‘¥¦Iÿ‹\ÞmA–#'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary '£)ûn\ÇûI½›\Ås(3I\ç\Æ'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary 'Úž£?E´‡7Ý´\ï†:\é'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary '\ëu\í&°\Â@ö’\Zþ\át'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary 'ôÏŠ¼r•H\rª· ¿”ÝŠ\Þ'),(_binary '¦Ni;º\\@-‡zfC\çNj',_binary 'þd®X\ç…OØ‡={\â\Ã~Á');
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` binary(16) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `name` varchar(50) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKofx66keruapi6vyqpv6f2or37` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (_binary '=VïŠ¿Ij£ˆ|,S\ænú','2026-01-29 20:22:40.470915','Student with limited access to educational resources',_binary '','STUDENT','2026-01-29 20:22:40.470915'),(_binary '¦Ni;º\\@-‡zfC\çNj','2026-01-29 20:22:40.468193','Administrator with full system access',_binary '','ADMIN','2026-01-29 20:22:40.468193');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` binary(16) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `role_id` binary(16) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  KEY `FKp56c1712k691lhsyewcssf40f` (`role_id`),
  CONSTRAINT `FKp56c1712k691lhsyewcssf40f` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (_binary 's1Úœ\×IŒ£iŽ;š®\×','2026-01-29 20:22:40.896648','admin@example.com','Admin',_binary '','User','$2a$10$p86dOI8gV1WcxbvYa0oH8edZJAmfLX3WXPSPMbD3Cg./5otRe0SSe','2026-01-29 20:22:40.896648',_binary '¦Ni;º\\@-‡zfC\çNj'),(_binary '¶\06\r“\ZK´\Öx5\î\Òöw','2026-01-29 20:22:40.903804','student@example.com','John',_binary '','Doe','$2a$10$qlTU3w.lim8.hqE/..CnpujuAgh.daX1U/OQV5Vl8V8NCFxvFAPZi','2026-01-29 20:22:40.903804',_binary '=VïŠ¿Ij£ˆ|,S\ænú'),(_binary 'ñ\é\é\ç<\rKM“r ®\å±\×','2026-01-29 20:22:40.915689','jane.smith@example.com','Jane',_binary '','Smith','$2a$10$E1ysDGjqqqvSjjASYRNiD.YEgUDqBnCnx3p8PacW2oDkxpnUNgGTW','2026-01-29 20:22:40.915689',_binary '=VïŠ¿Ij£ˆ|,S\ænú');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-29 20:51:36
