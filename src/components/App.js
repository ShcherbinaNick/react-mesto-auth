import React, { useEffect } from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import api from '../utils/Api';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import Login from './Login';
import Register from './Register';
import ProtectedRoute from './ProtectedRoute';
import InfoTooltip from './InfoTooltip';
import * as Auth from '../Auth';

function App() {

  const history = useHistory();

  const [ isLoggedIn, setIsLoggedIn ] = React.useState(false);
  const [ isSignUpSuccessful, setIsSignUpSuccessful ] = React.useState(false);

  const [ cards, setCards ] = React.useState([]);
  const [ selectedCard, setSelectedCard] = React.useState({ name: '', link: ''});
  
  const [ isEditProfilePopupOpen, setIsEditProfilePopupOpen ] = React.useState(false);
  const [ isAddPlacePopupOpen, setIsAddPlacePopupOpen ] = React.useState(false);
  const [ isEditAvatarPopupOpen, setIsEditAvatarPopupOpen ] = React.useState(false);
  const [ isInfoTooltipOpen, setIsInfoTooltipOpen ] = React.useState(false);
  
  const [ currentUser, setCurrentUser ] = React.useState({
    'name': '',
    'avatar': '',
    'about': '',
    '_id': '',
    'cohort': '',
    'email': ''
  });
  const [userEmail, setUserEmail] = React.useState("")

  const handleRegistration = (values) => {
    Auth.register(values)
    .then((res) => {
      setIsSignUpSuccessful(true)
      setIsInfoTooltipOpen(true)
      history.push("/sign-in")
      console.log(res)
    })
    .catch((err) => {
      setIsSignUpSuccessful(false)
      setIsInfoTooltipOpen(true)
      console.log(err)
    })
  }

  const handleLogin = (values) => {
    Auth.login(values)
    .then((res) => {
      localStorage.setItem('jwt', res.token)
      setIsLoggedIn(true)
      history.push("/")
      })
    .catch((err) => {
    console.log(err)
    })
  }

  const tokenCheck = () => {
    if (localStorage.getItem('jwt')) {
      const jwt = localStorage.getItem('jwt')
      if (jwt) {
        Auth.getContent(jwt)
      .then((res) => {
        setIsLoggedIn(true)
        history.push("/")
        setUserEmail(res.data.email)
      })
      .catch((err) => {
        console.log(err)
      })   
      }
    }
  }

  const handleCardLike = (card) => {
    // Снова проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some(i => i._id === currentUser._id);
    
    // Отправляем запрос в API и получаем обновлённые данные карточки
    api.changeLikeCardStatus(card._id, isLiked).then((newCard) => {
        setCards((cards) => cards.map((c) => c._id === card._id ? newCard : c))
      })
      .catch(err => console.log(err));
  } 

  const handleCardDelete = (card) => {
    api.removeCard(card._id)
    .then(() => {
      setCards(() => cards.filter(c => c._id !== card._id))
    })
    .catch(err => console.log(err))
  }

  const handleAddPlaceSubmit = (card) => {
    api.postCard(card)
      .then((newCard) => {
        setCards([newCard, ...cards])
        closeAllPopups()
      })
      .catch(err => console.log(err))
  }
  
  
  useEffect(() => {
    api.getUserInfo()
      .then(res => setCurrentUser(res))
      .catch(err => console.log(err))
  }, [])
  
  useEffect(() => {
    tokenCheck()
    api.getInitialCards()
      .then((places) => {
        setCards(places)
      })
      .catch(err => console.log(err))
  }, [])
  

  const handleEditAvatarClick = () => {
    setIsEditAvatarPopupOpen(!isEditAvatarPopupOpen)
  }
  
  const handleEditProfileClick = () => {
    setIsEditProfilePopupOpen(!isEditProfilePopupOpen)
  }

  const handleAddPlaceClick = () => {
    setIsAddPlacePopupOpen(!isAddPlacePopupOpen)
  }

  const handleCardClick = (cardData) => {
    setSelectedCard(cardData)
  }

  const closeAllPopups = () => {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard({ name: '', link: ''});
    setIsInfoTooltipOpen(false);
  }

  const handleUpdateUser = (newUserInfo) => {
    api.setUserInfo(newUserInfo)
      .then((newData) => {
        setCurrentUser(newData);
        closeAllPopups();
      })
      .catch(err => console.log(err))
  }

  const handleUpdateAvatar = (avatar) => {
    api.setAvatar(avatar)
      .then((newAvatar) => {
        setCurrentUser(newAvatar);
        closeAllPopups();
      })
      .catch(err => console.log(err))
  }

  return (
    <CurrentUserContext.Provider value={ currentUser }>
      <div className="App">
        <div className="page">
          <Header onLogOut={ setIsLoggedIn } userEmail={userEmail}/>
            <Switch>
              <ProtectedRoute 
                exact path="/" 
                loggedIn={ isLoggedIn } 
                component={ Main } 
                onEditAvatarClick={ handleEditAvatarClick }
                onEditProfileClick={ handleEditProfileClick }
                onAddPlaceClick={ handleAddPlaceClick }
                onCardClick={ handleCardClick }
                cards={ cards }
                onCardLike={ handleCardLike }
                onCardDelete={ handleCardDelete }>
              </ProtectedRoute>
              <Route path="/sign-up">
                <Register onSubmit={ handleRegistration } />
              </Route>
              <Route path="/sign-in">
                <Login onSubmit={ handleLogin } />
              </Route>
            </Switch>
          <Footer />
          <EditAvatarPopup isOpen={ isEditAvatarPopupOpen } onClose={ closeAllPopups } onUpdateAvatar={ handleUpdateAvatar } />
          <EditProfilePopup isOpen={ isEditProfilePopupOpen } onClose={ closeAllPopups } onUpdateUser={ handleUpdateUser } />
          <PopupWithForm name="card_delete" title="Вы уверены?" buttonText="Да">
          </PopupWithForm >
          <AddPlacePopup isOpen={ isAddPlacePopupOpen } onClose={ closeAllPopups }  onAddplaceSubmit={ handleAddPlaceSubmit }/>
          <ImagePopup onClose={ closeAllPopups } card={ selectedCard }/>
          <InfoTooltip isOpen={ isInfoTooltipOpen } onClose={ closeAllPopups } isSuccess={ isSignUpSuccessful } />
        </div>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
