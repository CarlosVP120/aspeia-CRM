CREATE TABLE contacto (
    id SERIAL PRIMARY KEY,
    avatar VARCHAR(255),
    full_name VARCHAR(255),
    post VARCHAR(255),
    email VARCHAR(255),
    city VARCHAR(255),
    start_date DATE,
    salary DECIMAL(10, 2),
    age INT,
    experience VARCHAR(255),
    status INT
);

-- Insert example data
INSERT INTO contacto (id, avatar, full_name, post, email, city, start_date, salary, age, experience, status)
VALUES 
(1, '8.png', 'Korrie O''Crevy', 'Nuclear Power Engineer', 'kocrevy0@thetimes.co.uk', 'Krasnosilka', '2016-09-23', 23896.35, 61, '1 Year', 2),
(7, '', 'Eileen Diehn', 'Environmental Specialist', 'ediehn6@163.com', 'Lampuyang', '2017-10-15', 18991.67, 59, '9 Years', 3),
(11, '', 'De Falloon', 'Sales Representative', 'dfalloona@ifeng.com', 'Colima', '2018-06-12', 19252.12, 30, '0 Year', 1),
(3, '7.png', 'Stella Ganderton', 'Operator', 'sganderton2@tuttocitta.it', 'Golcowa', '2018-03-24', 13076.28, 66, '6 Years', 2),
(5, '', 'Harmonia Nisius', 'Senior Cost Accountant', 'hnisius4@gnu.org', 'Lucan', '2017-08-25', 10909.52, 33, '3 Years', 2),
(6, '', 'Genevra Honeywood', 'Geologist', 'ghoneywood5@narod.ru', 'Maofan', '2017-06-01', 17803.8, 61, '1 Year', 1),
(4, '8.png', 'Dorolice Crossman', 'Cost Accountant', 'dcrossman3@google.co.jp', 'Paquera', '2017-12-03', 12336.17, 22, '2 Years', 2),
(8, '7.png', 'Richardo Aldren', 'Senior Sales Associate', 'raldren7@mtv.com', 'Skoghall', '2016-11-05', 19230.13, 55, '5 Years', 3),
(9, '2.png', 'Allyson Moakler', 'Safety Technician', 'amoakler8@shareasale.com', 'Mogilany', '2018-12-29', 11677.32, 39, '9 Years', 2),
(10, '7.png', 'Merline Penhalewick', 'Junior Executive', 'mpenhalewick9@php.net', 'Kanuma', '2019-04-19', 15939.52, 23, '3 Years', 2);


-- Create a table to store custom user data
CREATE TABLE custom_user_data (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    role VARCHAR(255),
);
ALTER TABLE custom_user_data
ADD COLUMN display_name VARCHAR(255);

-- Create a table dictionary that will save each of the entities definitions and what fields they have
CREATE TABLE diccionario (
    entity_name VARCHAR(255) PRIMARY KEY,
    fields JSONB
);

-- Insert the definitions of the contacto entity as contacto, this will be used to generate the forms in JS, so instead of VARCHAR(255) we will use string, instead of INT we will use number, etc.
INSERT INTO diccionario (entity_name, fields)
VALUES 
('contacto', '{
    "id": {
        "type": "number",
        "required": true,
        "label": "ID"
    },
    "avatar": {
        "type": "string",
        "label": "Avatar"
    },
    "full_name": {
        "type": "string",
        "required": true,
        "label": "Nombre"
    },
    "post": {
        "type": "string",
        "label": "Puesto"
    },
    "email": {
        "type": "string",
        "label": "Correo Electrónico"
    },
    "city": {
        "type": "string",
        "label": "Ciudad"
    },
    "start_date": {
        "type": "date",
        "label": "Fecha de Inicio"
    },
    "salary": {
        "type": "number",
        "label": "Salario"
    },
    "age": {
        "type": "number",
        "label": "Edad"
    },
    "experience": {
        "type": "string",
        "label": "Experiencia"
    },
    "status": {
        "type": "number",
        "label": "Estado"
    }
}');
