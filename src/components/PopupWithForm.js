function PopupWithForm({ name, title, buttonText="Сохранить", children, isOpen, onClose, onSubmit }) {
  
  function handleClickOverlay(e) {
    if (isOpen) {
      if(e.target.classList.contains('popup')) {
       onClose()
    }
    }
  }
  
  return (
    <>
      <article className={`popup popup_type_${ name } ${isOpen ? "popup_active" : "" }` } onClick={ handleClickOverlay }>
        <form onSubmit={ onSubmit } className="popup__container" name={` ${ name }-form`}>
          <button type="button" aria-label="закрыть" className="popup__close-button" onClick={ onClose }></button>
          <h2 className="popup__title">{ title }</h2>
          { children }
          <button className="popup__save-button" type="submit">{ buttonText }</button>
        </form>
      </article>
    </>
  );
}

export default PopupWithForm;

