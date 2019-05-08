const firebaseConfig = {
  apiKey: "AIzaSyC1loM_GSHPGQ9hoYyRA_htxsLnmDnwb4g",
  authDomain: "boogletranslate-fe8ae.firebaseapp.com",
  databaseURL: "https://boogletranslate-fe8ae.firebaseio.com",
  projectId: "boogletranslate-fe8ae",
  storageBucket: "boogletranslate-fe8ae.appspot.com",
  messagingSenderId: "1072846869412",
};

firebase.initializeApp(firebaseConfig);
INITIAL_SETTINGS = {
                    language: "",
                    loggedIn: null,
                    name: "",
                    firstTime: true,     //first time a user has logged in
                    currentlyAuth: true, //user is currently being verified
                    uid: "",
                    photoURL: ""
                   }

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = Object.assign({}, INITIAL_SETTINGS);

    this.storeLanguage = this.storeLanguage.bind(this);
    this.readLanguage = this.readLanguage.bind(this);
  }

  async facebookLogin() {
    const { type, token } = await
    Facebook.logInWithReadPermissionsAsync(
      "835368136823240",{
          permission: "public_profile"
      }
    );

    if (type == "success") {
      console.log("yeet");
      this.setState({loggedIn: true});
      const credential =
        firebase
          .auth
          .FacebookAuthProvider
          .credential(token);

      firebase
       .auth().signInWithCredential(credential)
       .catch(error => console.log(error));
    }
  }

  async facebookLogout() {
    try {
        await firebase.auth().signOut();
        this.setState({loggedIn:false});
    } catch (e) {
        console.log(e);
    }
  }


  storeLanguage(lang) {
    firebase.database().ref('users/' + this.state.uid).set({
      language: lang
    });
    this.setState({language: lang, firstTime: false});
  }

  readLanguage() {
    firebase.database().ref('users/' + this.state.uid).once('value')
      .then((snap) => {
        if(snap.exists()) {
          this.setState({firstTime: false});
        }
        this.setState({currentlyAuth:false});
      })
      .catch((e) => console.log(e));
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user != null) {
          const userInfo = user["providerData"][0];
          this.setState({
             loggedIn: true,
             name: userInfo["displayName"],
             uid: user["uid"],
             photoURL: userInfo["photoURL"]
          });
          this.readLanguage();
      } else {
        this.setState({ loggedIn: false });
        this.setState({currentlyAuth:false});
      }

    });
  }

  render() {
    const {loggedIn, language, firstTime, currentlyAuth, uid, name} = this.state;
    return (
      <View style={styles.view}>
        {currentlyAuth && <Text>Loading</Text>}
        {!loggedIn && !currentlyAuth &&
           <TouchableOpacity style={styles.blueStyle} full rounded onPress={() => this.facebookLogin()}>
            <Text style={styles.login}>Login with Facebook</Text>
           </TouchableOpacity>}

        {!firstTime && loggedIn &&
             <TouchableOpacity style={styles.redStyle} full rounded onPress={() => this.facebookLogout()}>
              <Text style={styles.login}>Logout</Text>
             </TouchableOpacity>
           }

        {firstTime && loggedIn && <SelectLang select={(lang) => this.storeLanguage(lang)}></SelectLang>}


      </View>
    );
  }
}

// {loggedIn &&
//   <TouchableOpacity style={styles.redStyle} full rounded onPress={() => {this.facebookLogout()}}>
//    <Text style={styles.login}>Login with Facebook</Text>
//   </TouchableOpacity>}
const styles = StyleSheet.create({
    view: {
      flex: 1,
      backgroundColor: "#fff",
       justifyContent: "center",
       alignItems: "center"
   },

   login: {
     color: "white"
   },
   redStyle: {
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#fff',
    height: 60,
    width: 110,
    borderRadius: 10,
    margin: 5,
    backgroundColor: 'red',
    justifyContent: 'center',
  },
  display: {
    fontWeight: 'bold',
    fontSize: 26,
    color: "black",
    marginTop: 200
  }
});
