export const parseTransferTypeFromDb = (dbType: string) => {
  if (dbType === "Retiro") {
    return "withdrawal";
  }
  if (dbType === "Deposito") {
    return "deposit";
  }
  return "transfer";
};
