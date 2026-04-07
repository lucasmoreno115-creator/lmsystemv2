export function createSubmitGuard() {
  let locked = false;
  return {
    lock() {
      if (locked) throw new Error('Envio já está em andamento. Aguarde.');
      locked = true;
    },
    release() { locked = false; }
  };
}
