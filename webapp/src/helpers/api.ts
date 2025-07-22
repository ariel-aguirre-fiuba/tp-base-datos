import { Transaction } from "@/types/banking";

const url = "http://localhost:3000/api";

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
