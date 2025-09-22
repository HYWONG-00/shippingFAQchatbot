import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");
const SERVER_PORT = 5000;
let loadInterval;

function loader(element){
    element.textContent="";

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text){
    let index = 0;

    let interval = setInterval(() => {
        if(index < text.length){
            element.innerHTML += text.charAt(index);
            index++;
        }else{
            //once finish typing,...
            clearInterval(interval);
        }
    }, 20);
}

function generateUID(){
    const timestamp = Date.now();
    const randomNum = Math.random();
    const hexString = randomNum.toString(16);

    return `id-${timestamp}-${hexString}`;
}

function chatStripe (isAi, value, uniqueID){
    return (
        `
            <div class="wrapper ${isAi && "ai"}">
                <div class="chat">
                    <div class="profile">
                        <img src="${isAi ? bot : user}"
                        alt="${isAi ? "bot" : "user"}"/>
                    </div>
                    <div class="message" id="${uniqueID}">
                        ${value}
                    </div>
                </div>
            </div>
        `
    )
}

const handleSubmit = async(e) => {
    e.preventDefault();

    const data = new FormData(form);

    //user's chat stripe
    chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

    form.reset();

    //bot's chat stripe (AI is typing...)
    const uniqueID = generateUID();
    console.log({uniqueID: uniqueID});
    chatContainer.innerHTML += chatStripe(true, " ", uniqueID);

    //keep scrolling down when AI is typing...
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueID);

    loader(messageDiv);

    
    //fetch data from server => get bot's response
    console.log("prompt", data.get("prompt"))
    const response = await fetch("https://problemsolver-p4gd.onrender.com", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            prompt: data.get("prompt")
        })
    });

    //stop loading
    clearInterval(loadInterval);
    messageDiv.innerHTML = "";

    if(response.ok){
        const data = await response.json();
        const parsedData = data.bot.trim();

        console.log({parsedData: parsedData});

        typeText(messageDiv, parsedData);
    }
    else{
        const err = await response.text();

        messageDiv.innerHTML = "Something went wrong";

        alert(err);
    }
}

form.addEventListener("submit", handleSubmit);
//when user hits "enter"
form.addEventListener("keyup", (e) => {
    if(e.keyCode === 13){
        handleSubmit(e);
    }
})