import React, { useEffect, useState } from 'react';
import 'rbx/index.css';
import { Button, Container, Title, Card, Column, Level, Image, Message, Navbar } from 'rbx';
import Sidebar from "react-sidebar";
import { render } from 'react-dom'
import { transitions, positions, Provider as AlertProvider } from 'react-alert'
import { useAlert } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import * as firebaseui from "firebaseui";


const firebaseConfig = {
  apiKey: "AIzaSyA3jGXaGPBvzgiTynqez7KwIkhlXhynukE",
  authDomain: "nu-cs397-learn-react-tutorial.firebaseapp.com",
  databaseURL: "https://nu-cs397-learn-react-tutorial.firebaseio.com",
  projectId: "nu-cs397-learn-react-tutorial",
  storageBucket: "nu-cs397-learn-react-tutorial.appspot.com",
  messagingSenderId: "991910079553",
  appId: "1:991910079553:web:6700a5475d022d9e75eac0"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref();

const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID],
  //credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,
  callbacks: {
    signInSuccessWithAuthResult: () => false
  }
};

const secondaryAppConfig = {
  apiKey: "AIzaSyDuJiDx3nyQ_i1dCh0CUsGoFhuf_iD24Ns",
  authDomain: "nu-cs397-learn-react-userdb.firebaseapp.com",
  databaseURL: "https://nu-cs397-learn-react-userdb.firebaseio.com",
  projectId: "nu-cs397-learn-react-userdb",
  storageBucket: "nu-cs397-learn-react-userdb.appspot.com",
  messagingSenderId: "1041177555949",
  appId: "1:1041177555949:web:dd896888f0a972a7adede4"
};
var secondDatabase = firebase.initializeApp(secondaryAppConfig, "secondary");
const second_db = secondDatabase.database().ref();

function cart_sort(arr, arr2){
    var a = [];
    var b = [];
    var c = [];
    var _products = [];
    var prev;
    
    for (var i = 0; i < arr.length; i++ ) {
    	if(i == 0) {
        	a.push(arr[i]);
            b.push(1);
            c.push((arr[i])[arr[i].length -1]);
            _products.push(arr2[i]);
        }
        else if ( i > 0 ) {
        	if(a.includes(arr[i]) === false ){
           	 	a.push(arr[i]);
            	b.push(1);
              c.push((arr[i])[arr[i].length -1]);
              _products.push(arr2[i]);
            }
            else {
           	 	b[a.indexOf(arr[i])]++;
        	}
        } 

        prev = arr[i];
    }
    return [a, b, c, _products];
    //returns array of arrays. first subarray is SKU + size identifier string, second subarray is quantity of each unique product (different sizes count as different product), third subarray is size of product, fourth array is actual product JSON object
}


const buttonState = selected => (
  selected ? `button is-success is-selected` : 'button'
);

const sizes = ['XS', 'S', 'M', 'L', 'XL'];

const SizeSelector = ({ state }) => (
  <div className="field has-addons">
  { Object.values(sizes)
      .map(value => 
        <button key={value}
          className={ buttonState(value === state.size) }
          onClick={ () => state.setSize(value) }>
          { value }
        </button>
      )
  }
  </div>
);

const RenderShoppingCart = ({ ShoppingCart, setShoppingCart, ShoppingCart2, setShoppingCart2, user}) => {
  const filteredShoppingCart = cart_sort(ShoppingCart, ShoppingCart2);
  if (ShoppingCart.length <= 0 && ShoppingCart2.length <= 0) {
    return <p> 
      Total: $0.00
    </p>
  } 
  else if (ShoppingCart.length == ShoppingCart2.length) {
    return (<React.Fragment> 
    {filteredShoppingCart[0].map((key, index) => {
        if(db.child(String(filteredShoppingCart[0][index]) + "/quantity/") == 0){
          setShoppingCart(ShoppingCart => ShoppingCart.filter(_product => _product !== filteredShoppingCart[0][index] ));
          setShoppingCart2(ShoppingCart2 => ShoppingCart2.filter(_product => _product !== filteredShoppingCart[3][index]));
          window.confirm(String(filteredShoppingCart[3][index].title) + " in size:" + String(filteredShoppingCart[3][index].size) + "is now out of stock and has been removed from your cart.");
        }
        else if(filteredShoppingCart[1][index] > db.child(String(filteredShoppingCart[0][index]) + "/quantity/")){
          while(filteredShoppingCart[1][index] > db.child(String(filteredShoppingCart[0][index]) + "/quantity/")){
            var _index = ShoppingCart2.indexOf(filteredShoppingCart[3][index]);
        
            ShoppingCart.splice(_index, 1);
            ShoppingCart2.splice(_index, 1);
        
            setShoppingCart(ShoppingCart => [...ShoppingCart]);
            setShoppingCart2(ShoppingCart2 => [...ShoppingCart2]);
          }
          window.confirm("The quantity you selected for " + String(filteredShoppingCart[3][index].title) + " in size:" + String(filteredShoppingCart[3][index].size) + "is no longer available and your cart has been updated with the remaining stock available.");
        }
        else{
          return <CartProductTest key= {key} product={filteredShoppingCart[3][index]} product_img_src = {"data/products/" + filteredShoppingCart[0][index].slice(0, -2) + "_2.jpg"} quantity = {filteredShoppingCart[1][index]} ShoppingCart = {ShoppingCart} setShoppingCart = {setShoppingCart} ShoppingCart2 = {ShoppingCart2} setShoppingCart2 = {setShoppingCart2} />
        }
      })
    }
      <p> 
      Total: $ <TotalCost ShoppingCart2 = {ShoppingCart2}/>
    </p> 
      <Button variant="primary" onClick={() => {
        if(user != null){
          filteredShoppingCart[0].map((key, index) => db.child(String(filteredShoppingCart[0][index]) + "/quantity/").transaction(quantity => Math.max( (quantity - filteredShoppingCart[1][index]) || 0) )
          );
          setShoppingCart(ShoppingCart => []); 
          setShoppingCart2(ShoppingCart2 => []); 
        }
        else{
          window.confirm("Please sign in to checkout.");
        }
      }
    }>
          Checkout 
        </Button>
    </React.Fragment>
    );
  }
  else{
    return null;
  }
}; 

const O_Product = ({ product, product_img_src, ShoppingCart, setShoppingCart, ShoppingCart2, setShoppingCart2 }) => (
  <Card>
    <a onClick={() => { 
    if(ShoppingCart.includes(product.sku + '_' + product.size) == false)
    {
      setShoppingCart(prevArray => [...prevArray, product.sku + '_' + product.size])
      setShoppingCart2(prevArray => [...prevArray, product])
    }
    else if(cart_sort(ShoppingCart, ShoppingCart2)[1][cart_sort(ShoppingCart, ShoppingCart2)[0].indexOf(product.sku + '_' + product.size)] < product.quantity){
      setShoppingCart(prevArray => [...prevArray, product.sku + '_' + product.size])
      setShoppingCart2(prevArray => [...prevArray, product])
        }
     }
    }>
    <Card.Image>
        <Image.Container size="6by3">
  <img src = { product_img_src } />
      </Image.Container>
    </Card.Image>
    { product.title }<br></br>${product.price}
    <br></br>
        </a>
  </Card>
);

const O_Products = ({ products, ShoppingCart, setShoppingCart, ShoppingCart2, setShoppingCart2 }) => {
  const [size, setSize] = React.useState('S');
  const sizeProducts = products.filter(product => size === product.size);

    return(
        <React.Fragment>

      <SizeSelector state={ { size, setSize } } />
      
             <Button.Group>

       {sizeProducts.map(product => {
         if(product.quantity > 0){
          return <O_Product key={product.sku} product={ product } 
            product_img_src = {"data/products/" + product.sku + "_1.jpg"}
            ShoppingCart={ShoppingCart}
            setShoppingCart={setShoppingCart}
            ShoppingCart2={ShoppingCart2}
            setShoppingCart2={setShoppingCart2}
            />
          }
        }
      )
    }
        </Button.Group>
          </React.Fragment>
  );
};

const CartProductTest = ({ product, product_img_src, quantity, ShoppingCart, setShoppingCart, ShoppingCart2, setShoppingCart2 }) => (
  <Card>
    <Card.Image>
        <Image.Container size="2by2">
  <img src = { product_img_src } />
      </Image.Container>
    </Card.Image>
    {product.title}
    <br></br> 
    {product.style} 
    <br></br>
    Size:{product.size}
    <br></br>
    ${product.price}
    <br></br>
    Quantity: {quantity}
    {" "} 
    <Button rounded = "true" size = "small" color = "info" onClick={() => {
        var _index = ShoppingCart2.indexOf(product);
        
        ShoppingCart.splice(_index, 1);
        ShoppingCart2.splice(_index, 1);
        
        setShoppingCart(ShoppingCart => [...ShoppingCart]);
        setShoppingCart2(ShoppingCart2 => [...ShoppingCart2]);
      }
    }>
          - 
        </Button>
    {" "} 
    <Button rounded = "true" size = "small" color = "danger" onClick={() => {
        setShoppingCart(ShoppingCart => ShoppingCart.filter(_product => _product !== (product.sku + "_" + product.size) ));
        setShoppingCart2(ShoppingCart2 => ShoppingCart2.filter(_product => _product !== product));
      }
    }>
          x
        </Button>
  </Card>
);

const TotalCost = ({ShoppingCart2}) => (
  Math.floor(ShoppingCart2.reduce((total_cost, index) => total_cost + index.price, 0) * 100)/100
);

const SignIn = () => (
  <StyledFirebaseAuth
    uiConfig={uiConfig}
    firebaseAuth={firebase.auth()}
  />
);

const UpdateUserSavedCart = ({ShoppingCart, ShoppingCart2, user, PreviousRetrieved}) => {
  if (user != null && PreviousRetrieved != false){
    var CurrentUser = firebase.auth().currentUser;
    var userId = CurrentUser.uid; 
    console.log("UpdateUserSavedCart:", userId);
      var ref = secondDatabase.database().ref(String(userId));
      ref.once("value").then(function(snapshot) {
        if (snapshot.hasChild("SavedShoppingCart") == true && snapshot.hasChild("SavedShoppingCart2") == true){
           console.log("UpdateUserSavedCart Firebase entry exists");
        secondDatabase.database().ref(String(userId) + "/SavedShoppingCart").transaction(
         SavedShoppingCart => ShoppingCart
          );
        secondDatabase.database().ref(String(userId) + "/SavedShoppingCart2").transaction(
         SavedShoppingCart2 => ShoppingCart2
          );
        }
        else { 
          console.log("UpdateUserSavedCart Firebase entry does not exist yet");
          secondDatabase.database().ref(String(userId) + "/").set({
            
              SavedShoppingCart: ShoppingCart,
              SavedShoppingCart2: ShoppingCart2
            
          })
        }
      }
    )}
  return null;
}

const Welcome = ({ user, setShoppingCart, setShoppingCart2, setPreviousRetrieved }) => (
  <Message color="info">
    <Message.Header>
      Welcome, {user.displayName} 
      <Button primary onClick={() => {
        firebase.auth().signOut();
        }
      }>
        Log out
      </Button>
    </Message.Header>
  </Message>
);


const Banner = ({ user, ShoppingCart, setShoppingCart, ShoppingCart2, setShoppingCart2, setPreviousRetrieved, PreviousRetrieved}) => (
    user ? <React.Fragment> 
   <UpdateUserSavedCart  ShoppingCart = {ShoppingCart} ShoppingCart2 = {ShoppingCart2} user = {user} PreviousRetrieved = {PreviousRetrieved} />
   <Welcome user={ user } setShoppingCart = {setShoppingCart} setShoppingCart2 = {setShoppingCart2} setPreviousRetrieved = {setPreviousRetrieved} />
   </React.Fragment> 
     : <SignIn/>     
);
//, <UpdateUserSavedCart  ShoppingCart = {ShoppingCart} ShoppingCart2 = {ShoppingCart2} user = {user} />

/*

 <Button primary onClick={() => {console.log("Current user:", user);}}> Check current user </Button>
   <Button primary onClick={() => {console.log("Current user ID:", firebase.auth().currentUser.uid);}}> Check current user ID </Button>
   <Button primary onClick={() => {console.log("PreviousRetrieved button:", PreviousRetrieved);}}> Check PreviousRetrieved </Button>
{ user ? (<UpdateUserSavedCart  ShoppingCart = {ShoppingCart} ShoppingCart2 = {ShoppingCart2} user = {user} />, <Welcome user={ user } setShoppingCart = {setShoppingCart} setShoppingCart2 = {setShoppingCart2} setPreviousRetrieved = {setPreviousRetrieved} />)
     : (<SignIn/>) }
*/

const RetrieveUserCart = ({user, setShoppingCart, setShoppingCart2, PreviousRetrieved, setPreviousRetrieved}) => {
  console.log("RetrieveUserCart:", user);
  console.log("RetrieveUserCart's PreviousRetrieved1:", PreviousRetrieved);
    if (user != null && PreviousRetrieved == false) {
      var CurrentUser = firebase.auth().currentUser;
      var userId = CurrentUser.uid; 
      console.log("RetrieveUserCart UserID:", userId);
      
      
      var ref = secondDatabase.database().ref(String(userId));
      ref.once("value").then(function(snapshot) {
        if (snapshot.hasChild("SavedShoppingCart") == true && snapshot.hasChild("SavedShoppingCart2") == true){
            //console.log(snapshot.val());
            console.log(snapshot.val().SavedShoppingCart);
            setShoppingCart(prevArray => [...prevArray, ...snapshot.val().SavedShoppingCart]);
            console.log(snapshot.val().SavedShoppingCart2);
            setShoppingCart2(prevArray => [...prevArray, ...snapshot.val().SavedShoppingCart2]);
          //console.log(  Object.values(secondDatabase.database().ref(String(userId) + "/SavedShoppingCart")) );
          //console.log(  Object.values(secondDatabase.database().ref(String(userId) + "/SavedShoppingCart2")) );
        }
      });
      
      /*
      var ref = secondDatabase.database().ref(String(userId) + "/SavedShoppingCart");
      var ref2 = secondDatabase.database().ref(String(userId) + "/SavedShoppingCart2");
      ref.on('value', function(snapshot) {
   console.log("userSavedCart:", snapshot.val() );
   //setShoppingCart(prevArray => [...prevArray, ...snapshot.val()]);
   if(snapshot.val() != null){
      setShoppingCart(prevArray => [...prevArray, ...snapshot.val()]);
   }
});
 ref2.on('value', function(snapshot) {
   console.log("userSavedCart2:", snapshot.val() );
   //setShoppingCart2(prevArray => [...prevArray, ...snapshot.val()]);
   if(snapshot.val() != null){
      setShoppingCart2(prevArray => [...prevArray, ...snapshot.val()]);
   }
});
*/
      /*
      ref.once("value").then(function(snapshot) {
        if (snapshot.hasChild("SavedShoppingCart") == true && snapshot.hasChild("SavedShoppingCart2") == true){
        var userSavedCart = Object.values(second_db.child(String(userId) + "/SavedShoppingCart/"));
        console.log("userSavedCart:", userSavedCart);
        var userSavedCart2 = Object.values(second_db.child(String(userId) + "/SavedShoppingCart2/"));
        console.log("userSavedCart2:", userSavedCart2);
        //setShoppingCart(prevArray => [...prevArray, userSavedCart]);
        //setShoppingCart2(prevArray => [...prevArray, userSavedCart2]);
        }
      });
      */
      setPreviousRetrieved(true); 
    }
    /*else if(user != null && PreviousRetrieved == true){
      
    }*/
    
    else if(user == null && PreviousRetrieved == true){
      setShoppingCart(prevArray => [...[]]); // or setShoppingCart(prevArray => [])
      setShoppingCart2(prevArray => [...[]]);
      setPreviousRetrieved(false);
    }
    return null;
}



const App = () => {
  const [data, setData] = useState({});
  const [_open, setOpen] = useState(false);
  const [_dock, setDock] = useState(false);
  const products = Object.values(data);
  
  const[ShoppingCart, setShoppingCart] = useState([]); 
  const[ShoppingCart2, setShoppingCart2] = useState([]); 
  
  const[user, setUser] = useState(null);
  const[PreviousRetrieved, setPreviousRetrieved] = useState(false);
  
  //const alert = useAlert();
  //const[LoggedIn?, setLoggedIn?] = useState(false);
  
  /*
  if(LoggedIn? == true){
  //better to do this when user signs in 
      setShoppingCart(prevArray => [...prevArray, userShoppingCart])
      setShoppingCart2(prevArray => [...prevArray, userShoppingCart2])
      
      
      
  }
  
  if(LoggedIn? == false){
    setShoppingCart(ShoppingCart => []); 
    setShoppingCart2(ShoppingCart2 => []); 
  }
  const userCart = Object.values(User);
  
  */
  
  /*
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('./data/inventory.json');
      const json = await response.json();
      setData(json);
    };
    fetchProducts();
  }, []);
  
  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch('./data/inventory.json');
      const json = await response.json();
      setUser(json);
    };
    fetchUser();
  }, []);
  */
  
  useEffect(() => {
    const handleData = snap => {
      if (snap.val()) setData(snap.val());
    };
    db.on('value', handleData, error => alert(error));
    return () => { db.off('value', handleData); };
  }, []);
  
  useEffect(() => {
    firebase.auth().onAuthStateChanged(setUser);
  }, []);

  return (
    <React.Fragment>
     <RetrieveUserCart 
     user = {user}
     setShoppingCart = {setShoppingCart}
     setShoppingCart2 = {setShoppingCart2}
     PreviousRetrieved = {PreviousRetrieved} 
     setPreviousRetrieved = {setPreviousRetrieved}
     />
     <Navbar fixed="top">
        <Navbar.Segment align="end">
        <Banner 
        user={ user }
        ShoppingCart = { ShoppingCart }
        setShoppingCart = { setShoppingCart }
        ShoppingCart2 = { ShoppingCart2 }
        setShoppingCart2 = { setShoppingCart2 } 
        setPreviousRetrieved = {setPreviousRetrieved}
        PreviousRetrieved = {PreviousRetrieved}
        />
      <Navbar.Item onClick={() => {
        if(_dock == false){
         setDock(true);
        }
        else{
          setDock(false)
        }
       }
      }>
        <img
        //src="bag-icon.png"
        src = "https://imageog.flaticon.com/icons/png/512/2/2772.png?size=1200x630f&pad=10,10,10,10&ext=png&bg=FFFFFFFF"
        alt="Shopping Cart Icon"
        role="presentation"
        width="25"
        height="25"
      />
      </Navbar.Item>
    </Navbar.Segment>
</Navbar>

<Sidebar
        sidebar={
          <RenderShoppingCart  
            ShoppingCart = {ShoppingCart} 
            setShoppingCart = {setShoppingCart} 
            ShoppingCart2 = {ShoppingCart2} 
            setShoppingCart2 = {setShoppingCart2} 
            user = {user}
          /> 
        }
        open = {_open}
        docked = {_dock}
        pullRight	= {true}
        onSetOpen = {setOpen}
        styles={{ sidebar: { position: "fixed", background: "white" } }}>
      </Sidebar>

    <Level>
      <O_Products products = {products} 
      ShoppingCart = {ShoppingCart}
      setShoppingCart = {setShoppingCart}
      ShoppingCart2 = {ShoppingCart2}
      setShoppingCart2 ={setShoppingCart2} />
      </Level>
      </React.Fragment>
  );
}; 

export default App;