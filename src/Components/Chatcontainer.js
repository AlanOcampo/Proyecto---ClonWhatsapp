import React,{useState, useRef, useEffect} from 'react';
//import Chatcontainer from 'react-chat-container';
import { render } from 'react-dom';
import { getStorage, ref } from "firebase/storage";

import Home from './Home';
import './Chatcontainer.css';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import ChatMessage from './ChatMessage';
import Picker from 'emoji-picker-react';
import {useParams} from 'react-router-dom'
import db from '../firebase';
import dbStorage from '../firebase';
import firebase from 'firebase'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Navigation } from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import 'firebase/storage';

//import  ReactImagePickerEditor, { ImagePickerConf } from 'react-image-picker-editor';

function Chatcontainer({currentUser}) {
  
  const [archivoUrl, setArchivoUrl] = React.useState("");
  const [docus,setDocus] = useState([]);
  const [message,setMessage] = useState("");
  const [openEmojiBox, setOpenEmojiBox]= useState(false);
  const {emailID }= useParams();
  const {nombreArchivo} = useParams();
  const [chatUser,setChatUser] = useState({});
  const chatBox = useRef(null);
  const [chatMessages, setChatMessages]= useState([])

  //const [dropdown, setDropdown]=useState(false);

  //const [imageSrc, setImageSrc] = useState ('');
/*
  const config2: ImagePickerConf = {
    borderRadius: '8px',
    language: 'en',
    width: '330px',
    height: '250px',
    objectFit: 'contain',
    // aspectRatio: 4 / 3,
    compressInitial: null,
  };
*/
  const archivoHandler = async (e)=> {
    
    
    if(archivoUrl === '')
    {
      var archivo = e.target.files[0];
      var storageRef = firebase.storage().ref();
      var archivoPath = storageRef.child(archivo.name);
      await archivoPath.put(archivo);
      console.log("archivo cargado:",archivo.name);
      const enlaceUrl = await archivoPath.getDownloadURL();
      
      setArchivoUrl(enlaceUrl);
      enlaceUrl='';
      
  }else{
    window.location="/"
  }
      //const nombreArchivo = (archivo.name);


      //console.log("archivo cargado:", nombreArchivo, "ulr:", enlaceUrl, "reciber", emailID, "senderEmail",currentUser.email);


  //e.target.nombre.value
 
  
 /*  
  const coleccionRef =  firebase.firestore().collection("archivos").doc(emailID).collection("messages")
  const docu = await coleccionRef.doc(nombreArchivo).set({nombre: nombreArchivo, text: enlaceUrl, senderEmail: currentUser.email, receiverEmail:emailID,timeStamp:firebase.firestore.Timestamp.now()});
  console.log("archivo cargado:", nombreArchivo, "ulr:", enlaceUrl, "reciber", emailID, "senderEmail",currentUser.email);
  //window.location="/"
   */ 
}


const submitHandler = async (e)=> {/*
  e.preventDefault()
const nombreArchivo = e.target.nombre.value;
if (!nombreArchivo) {
alert("coloca un nombre")
return
}

const coleccionRef =  firebase.firestore().collection("archivos").doc(emailID).collection("messages")
const docu = await coleccionRef.doc(nombreArchivo).set({nombre: nombreArchivo, url: archivoUrl, senderEmail: currentUser.email, receiverEmail:emailID,timeStamp:firebase.firestore.Timestamp.now()});
console.log("archivo cargado:", nombreArchivo, "ulr:", archivoUrl, "reciber", emailID, "senderEmail",currentUser.email);
window.location="/"
*/
}


useEffect(async ()=>{
  const docusList = await firebase.firestore().collection("archivos").doc(emailID).collection("message").get();
  setDocus(docusList.docs.map((doc)=> doc.data()));
  docusList();
}, [])



  useEffect(() => {
    const getUser =async()=>{
      const data = await db.collection("users").doc(emailID).onSnapshot((snapshot)=>{
        setChatUser(snapshot.data())
      })
    };
    const getMessages = async()=>{
      
      const data = await db.collection("chats").doc(emailID).collection("messages").orderBy("timeStamp","asc").onSnapshot((snapshot)=>{
        let messages = snapshot.docs.map((doc)=> doc.data());

        let newMessage = messages.filter(
          (message)=> 
          message.senderEmail === (currentUser.email || emailID) 
          ||
          message.receiverEmail === (currentUser.email || emailID)
          );
          setChatMessages(newMessage);
      })
      
    }
    /*const getPhotos = async()=>{
      const data = await db.collection("archivos").doc(emailID).collection("messages").orderBy("timeStamp","asc").onSnapshot((snapshot)=>{
        let messages = snapshot.docs.map((doc)=> doc.data());
        
        let newMessage = messages.filter(
          (message)=> 
          message.senderEmail === (currentUser.email || emailID) 
          || 
          message.receiverEmail === (currentUser.email || emailID)
          );
        
          setChatMessages(newMessage);
      })
    };*/
    console.log("",emailID);

    getUser();
    //getPhotos();
    getMessages();  

  },[emailID]);

useEffect(() => {
  chatBox.current.addEventListener("DOMNodeInserted",(event)=>{
    const {currentTarget : target} = event;
    target.scroll({top:target.scrollHeight, behavior: "smooth"})
  });
},[chatMessages])


//funcion muestra links de los documentos
const getPhotos = async()=>{
  const data = await db.collection("archivos").doc(emailID).collection("messages").orderBy("timeStamp","asc").onSnapshot((snapshot)=>{
    let messages = snapshot.docs.map((doc)=> doc.data());
    
    let newMessage = messages.filter(
      (message)=> 
      message.senderEmail === (currentUser.email || emailID) 
      || 
      message.receiverEmail  === (currentUser.email || emailID)
      );
    
      setChatMessages(newMessage);
  })
}; 

  const send = (e) =>{
    e.preventDefault();
    if(archivoUrl){}
    if(emailID){
      let payload = {
        text: message,
        senderEmail: currentUser.email,
        receiverEmail: emailID,
        url: archivoUrl,
        timeStamp: firebase.firestore.Timestamp.now(),
      };
      //sender
      db.collection("chats").doc(currentUser.email).collection("messages").add(payload)
      //reciber
      db.collection("chats").doc(emailID).collection("messages").add(payload)
      // addUser to sender
      db.collection("FriendList").doc(currentUser.email).collection("list").doc(emailID).set({
        email:chatUser.email,
        fullname: chatUser.fullname,
        photoURL:chatUser.photoURL,
        lastMessage:message,
      })

      db.collection("FriendList").doc(emailID).collection("list").doc(currentUser.email).set({
        email: currentUser.email,
        fullname: currentUser.fullname,
        photoURL: currentUser.photoURL,
        lastMessage: message,
      });

        setMessage("");
        setArchivoUrl("");
    }
  };
  const deleteFriend=async()=>{
    const data = db.collection("FriendList").doc(currentUser.email).collection("list").doc(chatUser.email);
    await data.delete();
    window.location="/"
  }

  return (
    <div className="chat-container">
      <div className="chat-container-header">
        <div className="chat-user-info">
          <div className="chat-user-img">
            <img src={chatUser?.photoURL} alt="" />
          </div>
          <p>{chatUser?.fullname}</p>
        </div>

        <div className="chat-container-header-btn">
            <DeleteForeverIcon onClick={()=>{alertDeleteFriend()}}/>
        </div>
      </div>
        
      {/* check displlay container */}

      <div className="chat-display-container" ref={chatBox}>
        {
          chatMessages.map((message)=>(
            <ChatMessage 
              message={message.text}
              url={message.url}
              time={message.timeStamp}
              sender={message.senderEmail}
            />
          ))
        }
        <div>
         {
         //docus.map((doc)=> <li><h3>{doc.text}</h3><img src={doc.text} height="100px" width="100px" alt=''/></li>)
         }
       </div>
      </div>
      {/*chat input */}
      <div className="chat-input" stylecolor="black">
      {openEmojiBox && <Picker onEmojiClick={(event,emojiObject) => setMessage (message+emojiObject.emoji)}/>}
      {/*buttons*/}
        <div className="chat-input-btn file-select">
           <InsertEmoticonIcon onClick={()=> setOpenEmojiBox(!openEmojiBox)}/>
      {/*Nueva fuincion, sube archivo a la base de datos archivoHandler */}
      <div className="inputDoc1">
            {<input type="file" nombre="src-file1"  accept="application/pdf, .doc, .docx, .odf, .rar, .zip" onChange={archivoHandler} />}
      </div>
      <div className="inputDoc2">
            {<input type="file" nombre="src-file1" accept="image/gif, .jpeg, .pjpeg, .png, .bmp, .svg+xml, .tiff,.jpg" onChange={archivoHandler}/>}
      </div >
      <div className="inputDoc3">
            {<input type="file" nombre="src-file1" accept="video/avi, .mpeg, .mp4, .ogg, .quicktime, .webm, .x-ms-wmv, .x-flv,.mkv" onChange={archivoHandler}/>}
      </div>
      <div className="inputDoc4">
            {<input type="file" nombre="src-file1" accept="audio/basic, .L24, .mpeg, .ogg, .vnd.wave, .x-aac, .mp3,.wav" onChange={archivoHandler}/>}
      </div>
      <div>
            {/*<button onClick={getMessages}>Documentos </button>*/}
      </div>
      <div>
            {/*<button onClick={getPhotos}> Documentos </button>*/}
      </div>
      
  </div>
      {/*text input element*/}
      <form onSubmit={send}>
        
        <input type="text" placeholder="Type a message" value={message} onChange={(e)=>{
          setMessage(e.target.value);
        }}/>
      </form>
      {/*send button */} 
      <div className="chat-input-btn" onClick={send}>
        <SendIcon/>
      </div> 
      </div> 
    </div>
  )

  function alertDeleteFriend(){
    var mensaje;
    var opcion = window.confirm("¿Realmente deseas eliminarlo de tu lista de amigos?");
    if (opcion == true) {
        mensaje = "Borraste a tu amigo";
        deleteFriend();
	} else {
	    mensaje = "No borraste a tu amigo";
	}
    console.log(mensaje);
}

}

export default Chatcontainer