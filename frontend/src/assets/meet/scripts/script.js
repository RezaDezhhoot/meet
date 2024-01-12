//  open and close mini menu

var BtnNMiniMenus = document.querySelectorAll('.btn-mini-menu');
var ShowMiniMenus = document.querySelectorAll('.show-mini-menu');
var CloseMiniMenus = document.querySelectorAll('.close-mini-menu');

BtnNMiniMenus.forEach((BtnNMiniMenu,index) => {
    BtnNMiniMenu.addEventListener('click', function handleClick(event) {
        ShowMiniMenus[index].classList.toggle("hidden");
        CloseMiniMenus[index].classList.toggle("hidden");
    });
});

CloseMiniMenus.forEach((CloseMiniMenu,index) => {
    CloseMiniMenu.addEventListener('click', function handleClick(event) {
        ShowMiniMenus[index].classList.toggle("hidden");
        CloseMiniMenus[index].classList.toggle("hidden");
    });
});


//  chenge acsses user

var ManageUserKick = document.querySelectorAll('.manage-user-kick');

ManageUserKick.forEach((UsersKick,index) => {
    UsersKick.addEventListener('click', function handleClick(event) {
        ManageUserKick[index].classList.toggle("icon-stroke-red");
        ManageUserKick[index].classList.toggle("text-[#df1111]");
        ManageUserKick[index].classList.toggle("border-[#df1111]");
    });
});

var ManageUserMic = document.querySelectorAll('.manage-user-mic');

ManageUserMic.forEach((UserMic,index) => {
    UserMic.addEventListener('click', function handleClick(event) {
        ManageUserMic[index].classList.toggle("icon-green");
    });
});

var ManageUserScreen = document.querySelectorAll('.manage-user-screen');

ManageUserScreen.forEach((UserScreen,index) => {
    UserScreen.addEventListener('click', function handleClick(event) {
        ManageUserScreen[index].classList.toggle("icon-stroke-green");
    });
});


//  chenge color icon with css

// var specers = document.querySelectorAll('.specer');
//
// specers.forEach((specer,index) => {
//     specer.addEventListener('click', function handleClick(event) {
//         specers[index].classList.toggle("icon-red");
//     });
// });

var cameras = document.querySelectorAll('.camera');

cameras.forEach((camera,index) => {
    camera.addEventListener('click', function handleClick(event) {
        cameras[index].classList.toggle("icon-red");
    });
});


var mics = document.querySelectorAll('.mic');

mics.forEach((mic,index) => {
    mic.addEventListener('click', function handleClick(event) {
        mics[index].classList.toggle("icon-yellow");
    });
});


// btn show menu

var btn = document.querySelectorAll('.btn-menu');
var ShowMenu = document.querySelector('.show-menu');
var CloseMenu = document.querySelector('.close-menu');

btn.forEach((btn,index) => {
    btn.addEventListener('click', function handleClick(event) {
        ShowMenu.classList.toggle("show");
        CloseMenu.classList.toggle("hidden");
    });
});


// btns tab bar


var BtnChatTab = document.querySelector('.btn-chat-tab');
var BtnUsersTab = document.querySelector('.btn-users-tab');
var BtnVideoTab = document.querySelector('.btn-video-tab');

var ChatTab = document.querySelector('.chat-tab');
var UsersTab = document.querySelector('.users-tab');
var VideoTab = document.querySelector('.video-tab');


(function (){
    BtnUsersTab.classList.remove('active');
    BtnVideoTab.classList.remove('active');
    BtnChatTab.classList.add('active');

    ChatTab.classList.remove('hidden-mobile');
    UsersTab.classList.add('hidden-mobile');
    VideoTab.classList.add('hidden-mobile');
})()

BtnChatTab.addEventListener('click', function handleClick(event) {
    BtnUsersTab.classList.remove('active');
    BtnVideoTab.classList.remove('active');
    BtnChatTab.classList.add('active');

    ChatTab.classList.remove('hidden-mobile');
    UsersTab.classList.add('hidden-mobile');
    VideoTab.classList.add('hidden-mobile');
});

BtnUsersTab.addEventListener('click', function handleClick(event) {
    BtnUsersTab.classList.add('active');
    BtnVideoTab.classList.remove('active');
    BtnChatTab.classList.remove('active');

    ChatTab.classList.add('hidden-mobile');
    UsersTab.classList.remove('hidden-mobile');
    VideoTab.classList.add('hidden-mobile');
});

BtnVideoTab.addEventListener('click', function handleClick(event) {
    BtnUsersTab.classList.remove('active');
    BtnVideoTab.classList.add('active');
    BtnChatTab.classList.remove('active');

    ChatTab.classList.add('hidden-mobile');
    UsersTab.classList.add('hidden-mobile');
    VideoTab.classList.remove('hidden-mobile');
});