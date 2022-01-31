import React from "react";
import AuthForm from "./AuthForm";
import { Link } from "react-router-dom";

const Register = ({ onSubmit }) => {

  return (
      <main className="auth">
        <section className="auth__container">
          <h2 className="auth__title">
            Регистрация
          </h2>
          <AuthForm buttonText="Зарегистрироваться" onSubmit={ onSubmit } />
          <Link className="auth__link" to="/sign-in">Уже зарегистрированы? Войти</Link>
        </section>
      </main>
  )
}

export default Register;