import React,{useState, useRef, useEffect} from 'react';
//import Chatcontainer from 'react-chat-container';
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
import firebase from 'firebase'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Navigation } from '@mui/icons-material';
import {useNavigate} from 'react-router-dom'


function Chatcontainer({currentUser}) {
  const [message,setMessage] = useState("");
  const [openEmojiBox, setOpenEmojiBox]= useState(false);
  const {emailID }= useParams();
  const [chatUser,setChatUser] = useState({});
  const chatBox = useRef(null);
  const [chatMessages, setChatMessages]= useState([])

  
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
    getUser();
    getMessages();
  },[emailID]);


useEffect(() => {
  chatBox.current.addEventListener("DOMNodeInserted",(event)=>{
    const {currentTarget : target} = event;
    target.scroll({top:target.scrollHeight, behavior: "smooth"})
  });
},[chatMessages])

  const send = (e) =>{
    e.preventDefault();
    if(emailID){
      let payload = {
        text: message,
        senderEmail: currentUser.email,
        receiverEmail: emailID,
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
    }
  };
  //proceso
  //<MoreVertIcon/>
  //chatUser.email

  //Delete Friend

  const deleteFriend=async()=>{
    const data = db.collection("FriendList").doc(currentUser.email).collection("list").doc(chatUser.email);
    await data.delete();
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
              time={message.timeStamp}
              sender={message.senderEmail}
            />
          ))
        }
      </div>
      {/*chat input */}
      <div className="chat-input">
      {openEmojiBox && <Picker onEmojiClick={(event,emojiObject) => setMessage (message+emojiObject.emoji)}/>}
      {}
      {/*buttons*/}
        <div className="chat-input-btn file-select">
           <InsertEmoticonIcon onClick={()=> setOpenEmojiBox(!openEmojiBox)}/>
           {/*<AttachFileIcon/>*/}
           <input type="file"/>
             
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