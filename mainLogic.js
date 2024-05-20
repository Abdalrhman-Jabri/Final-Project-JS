const baseUrl = "https://tarmeezacademy.com/api/v1";




function setupUI() {
    const token = localStorage.getItem("token");


    const logindiv = document.getElementById("login-div")
    const logoutdiv = document.getElementById("logout-div");
    const addBtn = document.getElementById("add-btn");

    if (token == null) {
        if (addBtn !== null) {
            addBtn.style.setProperty("display", "none", "important");
        }
        logindiv.style.setProperty("display", "flex", "important");
        logoutdiv.style.setProperty("display", "none", "important");
    } else {// For Logged In User
        if (addBtn !== null) {
            addBtn.style.setProperty("display", "block", "important");
        }
        logindiv.style.setProperty("display", "none", "important");
        logoutdiv.style.setProperty("display", "flex", "important");

        const user = getCurrentUser();
        document.getElementById("profile-name").innerHTML = `@${user.username}`;
        document.getElementById("profile-pic").src = user.profile_image;

    }
}

// ========= AUTH FUNCTIONS ======= //
function loginBtnClicked() {
    const username = document.getElementById("username-input").value
    const password = document.getElementById("password-input").value

    const params = {
        "username": username,
        "password": password
    }

    const url = `${baseUrl}/login`;
    toggleLoader(true)
    axios.post(url, params)
        .then((response) => {
            localStorage.setItem("token", response.data.token)
            localStorage.setItem("user", JSON.stringify(response.data.user));

            const modal = document.getElementById("login-modal");
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            showAlert("Logged In Successfuly", 'success');
            setupUI();
        })
        .catch((error) => {

            showAlert(error.response.data.message, "danger")
        })
        .finally(() => {
            toggleLoader(false)
        })
}

function registerBtnClicked() {
    const name = document.getElementById("registerName-input").value;
    const username = document.getElementById("registerUsername-input").value;
    const password = document.getElementById("registerPassword-input").value;
    const image = document.getElementById("register-image-input").files[0];
    const formData = new FormData();
    formData.append("username", username);
    formData.append("name", name);
    formData.append("image", image);
    formData.append("password", password);

    const url = `${baseUrl}/register`;
    toggleLoader(true)
    axios.post(url, formData)
        .then((response) => {

            localStorage.setItem("token", response.data.token)
            localStorage.setItem("user", JSON.stringify(response.data.user));

            const modal = document.getElementById("register-modal");
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            showAlert("New User Registered Successfuly", 'success');
            setupUI();
        })
        .catch((error) => {
            const errors = error.response.data.message;
            showAlert(errors, 'danger');
        })
        .finally(() => {
            toggleLoader(false)
        })
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showAlert("Logged Out Successfully");
    setupUI();
}

function showAlert(customMessage, type = 'success') {
    const alerPlaceHolder = document.getElementById("success-alert");
    const alert = (message, type) => {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            ' <button type="button" class ="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');
        alerPlaceHolder.append(wrapper);
    }
    alert(customMessage, type);
    // todo : hide alert
}

function getCurrentUser() {
    let user = null;
    const storageUser = localStorage.getItem("user");
    if (storageUser !== null) {
        user = JSON.parse(storageUser);
    }
    return user;
}

function addTags(tagsArray) {
    let Tags = "";
    for (tag of tagsArray) {
        let content = `
        <span class="bg-secondary rounded-pill p-2 mx-1 text-white">${tag.name}</span>
        `
        Tags += content;
    }
    return Tags;
}

//======== POSTS REQUEST========//
function editPostBtnClicked(postObject) {
    let post = JSON.parse(decodeURIComponent(postObject))
    document.getElementById("post-modal-submit-btn").innerHTML = "Update"
    document.getElementById("post-id-input").value = post.id;
    document.getElementById("newPost-modal-title").innerHTML = "Edit Post"
    document.getElementById("post-title-input").value = post.title;
    document.getElementById("post-body-input").value = post.body
    let postModal = new bootstrap.Modal(document.getElementById("newPost-modal"), {})
    postModal.toggle();
}

function deletePostBtnClicked(postObject) {
    let post = JSON.parse(decodeURIComponent(postObject))
    document.getElementById("delete-post-id-input").value = post.id
    let postModal = new bootstrap.Modal(document.getElementById("delete-post-modal"), {})
    postModal.toggle();
}

function confirmPostDelete() {
    let token = localStorage.getItem("token");
    let postId = document.getElementById("delete-post-id-input").value;
    let url = `${baseUrl}/posts/${postId}`

    let headers = {
        "authorization": `Bearer ${token}`
    }
    toggleLoader(true)
    axios.delete(url, { headers: headers })
        .then(() => {
            const modal = document.getElementById("delete-post-modal");
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            showAlert("Post Deleted Successfuly", 'success');
            getPosts();
        })
        .catch((error) => {
            showAlert(error.response.data.message, "danger");
        })
        .finally(() => {
            toggleLoader(false)
        })
}

function createNewPostClicked() {
    let postId = document.getElementById("post-id-input").value;
    let isCreate = postId === null || postId === "";

    const title = document.getElementById("post-title-input").value
    const body = document.getElementById("post-body-input").value
    const image = document.getElementById("post-image-input").files[0];



    const params = new FormData();
    params.append("title", title)
    params.append("body", body)
    params.append("image", image)

    let url = ``;
    const headers = {
        "authorization": `Bearer ${localStorage.getItem('token')}`
    }
    if (isCreate) {
        url = `${baseUrl}/posts`
    } else {
        params.append("_method", "put")
        url = `${baseUrl}/posts/${postId}`
    }
    toggleLoader(true)
    axios.post(url, params, {
        headers: headers
    })
        .then(() => {
            const modal = document.getElementById("newPost-modal");
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            showAlert("Post Created Successfuly", 'success');
            getPosts();
        })
        .catch((error) => {
            showAlert(error.response.data.message, "danger");
        })
        .finally(() => {
            toggleLoader(false)
        })

}

function postClicked(postId) {


    window.location = `postDetails.html?postId=${postId}`;
}

function addBtnClicked() {
    document.getElementById("post-modal-submit-btn").innerHTML = "Create"
    document.getElementById("post-id-input").value = "";
    document.getElementById("newPost-modal-title").innerHTML = "Create New Post"
    document.getElementById("post-title-input").value = "";
    document.getElementById("post-body-input").value = ""
    let postModal = new bootstrap.Modal(document.getElementById("newPost-modal"), {})
    postModal.toggle();
}

function profileClicked() {
    let user = getCurrentUser()

    window.location = `profile.html?userid=${user.id}`

}


function toggleLoader(show = true) {
    if (show) {
        document.getElementById("loader").style.setProperty("visibility", "visible", "important")
    } else {
        document.getElementById("loader").style.setProperty("visibility", "hidden", "important")
    }
}
