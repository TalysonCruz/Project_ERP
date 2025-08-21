import { cnpj } from "cpf-cnpj-validator";
import { isValidPhoneNumber } from "libphonenumber-js";
import { isEmail } from "validator";

export function validarTelefone(tel: string) {
  if (isValidPhoneNumber(tel, "BR")) return tel;
  throw new Error("Número de telefone inválido");
}

export function validarCNPJ(cpnjInput: string) {
  if (cnpj.isValid(cpnjInput)) return cnpj.format(cpnjInput);
  throw new Error("CNPJ inválido");
}

export function validadorEmail(email: string) {
  if (isEmail(email)) return { email };
  throw new Error("Email inválido");
}
