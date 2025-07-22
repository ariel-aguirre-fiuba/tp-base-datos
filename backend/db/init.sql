
-- ##########################################################################
-- #                                                                        #
-- #                     DDL: CREACIÓN DE TABLAS Y RELACIONES               #
-- #                                                                        #
-- ##########################################################################

-- Tabla: Usuario
-- Almacena información sobre los clientes del banco.
CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    dni VARCHAR(15) UNIQUE NOT NULL, -- DNI debe ser único
    direccion VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    fecha_nacimiento DATE
);

-- Tabla: Cuenta
-- Almacena las cuentas bancarias asociadas a los usuarios.
CREATE TABLE Cuenta (
    id_cuenta SERIAL PRIMARY KEY,
    numero_cuenta VARCHAR(20) UNIQUE NOT NULL, -- Número de cuenta debe ser único
    tipo_cuenta VARCHAR(20) CHECK (tipo_cuenta IN ('Ahorro', 'Corriente')), -- Restricción de tipos de cuenta
    saldo DECIMAL(12,2) DEFAULT 0.00 NOT NULL, -- Saldo inicial por defecto y no puede ser nulo
    fecha_apertura DATE NOT NULL,
    id_usuario INT NOT NULL, -- Clave foránea que referencia al usuario dueño de la cuenta
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- Tabla: Transaccion
-- Registra todos los movimientos de dinero entre cuentas o hacia/desde el banco.
CREATE TABLE Transaccion (
    id_transaccion SERIAL PRIMARY KEY,
    monto DECIMAL(12,2) NOT NULL CHECK (monto > 0.00), -- Monto no puede ser nulo y debe ser positivo
    tipo_transaccion VARCHAR(20) CHECK (tipo_transaccion IN ('Deposito', 'Retiro', 'Transferencia')), -- Restricción de tipos de transacción
    fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Fecha y hora de la transacción, por defecto la actual
    id_cuenta_origen INT NOT NULL, -- Cuenta desde donde sale el dinero (o a la que se deposita/retira)
    id_cuenta_destino INT, -- Cuenta a la que llega el dinero (NULL para depósitos/retiros)
    FOREIGN KEY (id_cuenta_origen) REFERENCES Cuenta (id_cuenta),
    FOREIGN KEY (id_cuenta_destino) REFERENCES Cuenta(id_cuenta)
);

-- ##########################################################################
-- #                                                                        #
-- #                     DML: POBLACIÓN INICIAL DE DATOS (SEED DATA)        #
-- #                                                                        #
-- ##########################################################################

-- Insertar datos de ejemplo para usuarios
INSERT INTO Usuario (nombre, apellido, dni, direccion, telefono, email, fecha_nacimiento) VALUES
('Juan', 'Pérez', '12345678', 'Av. Siempreviva 123, Springfield', '1123456789', 'juan.perez@fi.uba.ar', '1990-01-15'),
('Ana', 'García', '87654321', 'Calle Falsa 456, Capital', '1198765432', 'ana.garcia@fi.uba.ar', '1985-07-20'),
('Carlos', 'Rodríguez', '99887766', 'Bv. del Sol 789, Gran Buenos Aires', '1155443322', 'carlos.r@fi.uba.ar', '1978-03-01');

-- Insertar datos de ejemplo para cuentas
-- Asegúrate de que los id_usuario existan de los inserts anteriores
INSERT INTO Cuenta (numero_cuenta, tipo_cuenta, saldo, fecha_apertura, id_usuario) VALUES
('ABC001', 'Ahorro', 1500.50, '2023-01-10', 1), -- Cuenta de Juan Pérez
('XYZ002', 'Corriente', 5000.00, '2023-03-22', 1), -- Otra cuenta de Juan Pérez
('DEF003', 'Ahorro', 2300.75, '2023-02-14', 2), -- Cuenta de Ana García
('GHI004', 'Corriente', 800.00, '2023-04-01', 3); -- Cuenta de Carlos Rodríguez

-- Insertar datos de ejemplo para transacciones
-- Asegúrate de que los id_cuenta_origen y id_cuenta_destino existan
INSERT INTO Transaccion (monto, tipo_transaccion, fecha_hora, id_cuenta_origen, id_cuenta_destino) VALUES
(200.00, 'Deposito', '2024-06-10 10:00:00', 1, NULL), -- Depósito en cuenta ABC001
(50.00, 'Retiro', '2024-06-11 11:30:00', 1, NULL), -- Retiro de cuenta ABC001
(100.00, 'Deposito', '2024-06-12 09:00:00', 3, NULL), -- Depósito en cuenta DEF003
(300.00, 'Transferencia', '2024-06-12 14:45:00', 1, 2), -- Transferencia de ABC001 a XYZ002
(150.00, 'Transferencia', '2024-06-13 16:00:00', 2, 3), -- Transferencia de XYZ002 a DEF003
(25.00, 'Retiro', '2024-06-14 10:15:00', 3, NULL); -- Retiro de cuenta DEF003
