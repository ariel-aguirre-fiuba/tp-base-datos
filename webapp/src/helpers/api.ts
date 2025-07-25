const url = import.meta.env.VITE_API_URL;

export const getTransactions = async (userId: string) => {
  try {
    const response = await fetch(`${url}/cuentas/${userId}/transacciones`);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);

    return json;
  } catch (error) {
    console.error(error.message);
  }
};

export const getAccounts = async (userId: string) => {
  try {
    const response = await fetch(`${url}/usuarios/${userId}/cuentas`);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);

    return json;
  } catch (error) {
    console.error(error.message);
  }
};

export const getAllAccounts = async () => {
  try {
    const response = await fetch(`${url}/cuentas`);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);

    return json;
  } catch (error) {
    console.error(error.message);
  }
};

export const getUser = async (email: string) => {
  try {
    const response = await fetch(`${url}/login/${email}`);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);

    return json;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

export const registerUser = async (
  email: string,
  firstName: string,
  lastName: string
) => {
  try {
    const response = await fetch(`${url}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: firstName, apellido: lastName, email }),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);

    return json;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

export const transfer = async (
  monto: number,
  idCuentaOrigen: number,
  idCuentaDestino: number
) => {
  try {
    const response = await fetch(`${url}/transacciones/transferencia`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monto, idCuentaOrigen, idCuentaDestino }),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);

    return json;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

export const createAcc = async (
  numeroCuenta: string,
  tipoCuenta: string,
  idUsuario: string
) => {
  try {
    const response = await fetch(`${url}/cuentas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numeroCuenta, tipoCuenta, idUsuario }),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);

    return json;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};
