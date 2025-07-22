import { Client } from "pg";
import express from "express";
import cors from "cors";
import "dotenv/config";

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

await client.connect();

const port = 3000;
const app = express();
app.use(express.json());
app.use(cors());

const PREFIX = "/api";

// 1. CREACIÓN DE DATOS

// Crear un nuevo usuario
app.post(`${PREFIX}/usuarios`, async (req, res) => {
  const { nombre, apellido, email } = req.body;
  if (!nombre || !apellido || !email) {
    res.status(400).send("Parámetros inválidos");
    return;
  }
  const mockDni = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");
  const mockDireccion = "Calle Falsa 123";
  const mockTelefono = "1234-9876";
  const mockFechaNacimiento = "2025-07-23";

  const queryResponse = await client.query(
    "INSERT INTO Usuario (nombre, apellido, dni, direccion, telefono, email, fecha_nacimiento) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [
      nombre,
      apellido,
      mockDni,
      mockDireccion,
      mockTelefono,
      email,
      mockFechaNacimiento,
    ]
  );
  res.status(200).send(queryResponse.rows);
});

// Abrir una nueva cuenta para un usuario existente
app.post(`${PREFIX}/cuentas`, async (req, res) => {
  const { numeroCuenta, tipoCuenta, idUsuario } = req.body;
  if (!numeroCuenta || !tipoCuenta || !idUsuario) {
    res.status(400).send("Parámetros inválidos");
    return;
  }
  const queryResponse = await client.query(
    "INSERT INTO Cuenta (numero_cuenta, tipo_cuenta, saldo, fecha_apertura, id_usuario) VALUES ($1, $2, 0.00, CURDATE(), $3)",
    [numeroCuenta, tipoCuenta, idUsuario]
  );
  res.status(200).send(queryResponse.rows);
});

// Registrar un Depósito
app.post(`${PREFIX}/transacciones/deposito`, async (req, res) => {
  const { monto, idCuentaDestino } = req.body;
  if (!monto || !idCuentaDestino) {
    res.status(400).send("Parámetros inválidos");
    return;
  }
  const queryResponse = await client.query(
    "INSERT INTO Transaccion (monto, tipo_transaccion, fecha_hora, id_cuenta_origen, id_cuenta_destino) VALUES ($1, 'Deposito', NOW(), $2, NULL)",
    [monto, idCuentaDestino]
  );
  await client.query(
    "UPDATE Cuenta SET saldo = saldo + $1 WHERE id_cuenta = $2",
    [monto, idCuentaDestino]
  );
  res.status(200).send(queryResponse.rows);
});

// Registrar un Retiro
app.post(`${PREFIX}/transacciones/retiro`, async (req, res) => {
  const { monto, idCuentaOrigen } = req.body;
  if (!monto || !idCuentaOrigen) {
    res.status(400).send("Parámetros inválidos");
    return;
  }
  const queryResponse = await client.query(
    "INSERT INTO Transaccion (monto, tipo_transaccion, fecha_hora, id_cuenta_origen, id_cuenta_destino) VALUES ($1, 'Retiro', NOW(), $2, NULL)",
    [monto, idCuentaOrigen]
  );
  await client.query(
    "UPDATE Cuenta SET saldo = saldo - $1 WHERE id_cuenta = $2;",
    [monto, idCuentaOrigen]
  );
  res.status(200).send(queryResponse.rows);
});

// Registrar una Transferencia
app.post(`${PREFIX}/transacciones/transferencia`, async (req, res) => {
  const { monto, idCuentaOrigen, idCuentaDestino } = req.body;
  if (!monto || !idCuentaOrigen || !idCuentaDestino) {
    res.status(400).send("Parámetros inválidos");
    return;
  }
  const queryResponse = await client.query(
    "INSERT INTO Transaccion (monto, tipo_transaccion, fecha_hora, id_cuenta_origen, id_cuenta_destino) VALUES ($1, 'Transferencia', NOW(), $2, $3)",
    [monto, idCuentaOrigen, idCuentaDestino]
  );
  await client.query(
    "UPDATE Cuenta SET saldo = saldo - $1 WHERE id_cuenta = $2;",
    [monto, idCuentaOrigen]
  );
  await client.query(
    "UPDATE Cuenta SET saldo = saldo + $1 WHERE id_cuenta = $2",
    [monto, idCuentaDestino]
  );

  res.status(200).send(queryResponse.rows);
});

// 2. LECTURA DE DATOS

// Obtener todos los datos de unario por su email
app.get(`${PREFIX}/login/:email`, async (req, res) => {
  const queryResponse = await client.query(
    "SELECT id_usuario, nombre, apellido, dni, direccion, telefono, email, fecha_nacimiento FROM Usuario WHERE email = $1",
    [req.params.email]
  );
  if (queryResponse.rows.length < 1) {
    res.status(404).send("Usuario no encontrado");
    return;
  }
  res.status(200).send(queryResponse.rows);
});

// Obtener todos los datos de unario por su DNI
app.get(`${PREFIX}/usuarios/:dni`, async (req, res) => {
  const queryResponse = await client.query(
    "SELECT id_usuario, nombre, apellido, dni, direccion, telefono, email, fecha_nacimiento FROM Usuario WHERE dni = $1",
    [req.params.dni]
  );
  if (queryResponse.rows.length < 1) {
    res.status(404).send("Usuario no encontrado");
    return;
  }
  res.status(200).send(queryResponse.rows);
});

// Obtener todas las cuentas de un usuario por su ID
app.get(`${PREFIX}/usuarios/:id/cuentas`, async (req, res) => {
  const queryResponse = await client.query(
    "SELECT id_cuenta, numero_cuenta, tipo_cuenta, saldo, fecha_apertura FROM Cuenta WHERE id_usuario = $1",
    [req.params.id]
  );
  if (queryResponse.rows.length < 1) {
    res.status(404).send("Cuentas o usuario no encontrados");
    return;
  }
  res.status(200).send(queryResponse.rows);
});

// Obtener el historial de transacciones de una cuenta específica
app.get(`${PREFIX}/cuentas/:id/transacciones`, async (req, res) => {
  const queryResponse = await client.query(
    "SELECT T.id_transaccion, T.monto, T.tipo_transaccion, T.fecha_hora, COALESCE(CO.numero_cuenta, 'N/A') AS cuenta_origen_numero, COALESCE(CD.numero_cuenta, 'N/A') AS cuenta_destino_numero FROM Transaccion T LEFT JOIN Cuenta CO ON T.id_cuenta_origen = CO.id_cuenta LEFT JOIN Cuenta CD ON T.id_cuenta_destino = CD.id_cuenta WHERE T.id_cuenta_origen = $1 OR T.id_cuenta_destino = $1 ORDER BY T.fecha_hora DESC",
    [req.params.id]
  );
  if (queryResponse.rows.length < 1) {
    res.status(404).send("Cuentas o usuario no encontrados");
    return;
  }
  res.status(200).send(queryResponse.rows);
});

// 3. ACTUALIZACIÓN DE DATOS

// Actualizar la dirección y teléfono de un usuario
app.put(`${PREFIX}/usuarios/:id`, async (req, res) => {
  const { id } = req.params;
  const { nuevaDireccion, nuevoTelefono } = req.body;
  if (!nuevaDireccion || !nuevoTelefono || !id) {
    res.status(400).send("Parámetros inválidos");
    return;
  }
  const queryResponse = await client.query(
    "UPDATE Usuario SET direccion = $1, telefono = $2 WHERE id_usuario = $3",
    [nuevaDireccion, nuevoTelefono, id]
  );
  res.status(200).send(queryResponse.rows);
});

// 4. ELIMINACIÓN DE DATOS

// Eliminar un usuario
app.delete(`${PREFIX}/usuarios/:id`, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send("ID Inválida");
    return;
  }
  const queryResponse = await client.query(
    "DELETE FROM Usuario WHERE id_usuario = $1",
    [id]
  );
  res.status(200).send(queryResponse.rows);
});

// Cerrar una cuenta
app.delete(`${PREFIX}/cuentas/:id`, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send("ID Inválida");
    return;
  }
  const queryResponse = await client.query(
    "DELETE FROM Cuenta WHERE id_cuenta = $1",
    [id]
  );
  res.status(200).send(queryResponse.rows);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
