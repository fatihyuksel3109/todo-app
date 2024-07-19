const prebuiltTodos = [
    { id: 1, text: 'Learn JavaScript', comments: ['Great start!'] },
    { id: 2, text: 'Build a To-Do App', comments: ['Make it interactive!'] }
];

let todos = [];
let isLoggedIn = false;
let currentTodoId = null;
let currentCommentIndex = null;

// Simulated fetch function to get prebuilt to-dos
function fetchTodos() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...prebuiltTodos]); // Return a copy to prevent direct modification
        }, 500); // Simulate network delay
    });
}

// Utility functions for cookie handling
function setCookie(name, value, minutes) {
    let expires = "";
    if (minutes) {
        const date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000)); // Convert minutes to milliseconds
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
    if (name === 'username') {
        setCookie('expires', new Date(Date.now() + minutes * 60 * 1000).toUTCString(), minutes); // Store expiration time
    }
}


function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {   
    document.cookie = name + '=; Max-Age=-99999999;';  
}

// Function to check if the session is still valid
function checkSession() {
    const username = getCookie('username');
    if (username) {
        const now = new Date();
        const expirationDate = new Date(getCookie('expires')); // Assuming 'expires' cookie is set for expiration time

        if (now > expirationDate) {
            // Session expired
            alert('Session expired. Please log in again.');
            logout();
        } else {
            isLoggedIn = true;
            document.getElementById('auth').style.display = 'none';
            document.getElementById('todo-container').style.display = 'block';
            document.getElementById('profile').style.display = 'flex';
            document.getElementById('profile-name').textContent = username;
            loadTodos();
        }
    } else {
        document.getElementById('auth').style.display = 'block';
        document.getElementById('todo-container').style.display = 'none';
        document.getElementById('profile').style.display = 'none';
    }
}

// Call checkSession on page load to verify session validity
checkSession();

// Function to handle user login
function login() {
    const username = document.getElementById('username').value;
    if (username) {
        isLoggedIn = true;
        setCookie('username', username, 30); // Set cookie to expire in 30 minutes
        document.getElementById('auth').style.display = 'none';
        document.getElementById('todo-container').style.display = 'block';
        document.getElementById('profile').style.display = 'flex';
        document.getElementById('profile-name').textContent = username;
        loadTodos();
    } else {
        alert('Please enter a username.');
    }
}

// Function to handle user logout
function logout() {
    isLoggedIn = false;
    eraseCookie('username');
    document.getElementById('auth').style.display = 'block';
    document.getElementById('todo-container').style.display = 'none';
    document.getElementById('profile').style.display = 'none';
    document.getElementById('todo-list').innerHTML = '';
    window.location.reload(); // Refresh the page
}


// Call checkSession on page load to verify session validity
checkSession();

// Function to load to-dos from simulated fetch
async function loadTodos() {
    try {
        todos = await fetchTodos(); // Fetch prebuilt to-dos
        renderTodos();
    } catch (error) {
        console.error('Error loading todos:', error);
    }
}

// Function to render to-dos to the UI
function renderTodos() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${todo.text}</span>
            <button class="show-comments" onclick="showComments(${todo.id})">Show Comments</button>
            <div class="actions">
                <button class="edit" onclick="updateTodo(${todo.id})">Edit</button>
                <button class="delete" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        `;
        todoList.appendChild(li);
    });
}

// Function to add a new to-do
function addTodo() {
    if (!isLoggedIn) {
        alert('You must be logged in to add a to-do.');
        return;
    }

    const newTodoText = document.getElementById('new-todo').value;
    if (newTodoText) {
        const newTodo = {
            id: Date.now(),
            text: newTodoText,
            comments: []
        };
        todos.push(newTodo);
        document.getElementById('new-todo').value = '';
        renderTodos();
    } else {
        alert('Please enter a to-do.');
    }
}

// Function to update a to-do
function updateTodo(id) {
    const newText = prompt('Enter new text for the to-do:');
    if (newText) {
        todos = todos.map(todo => todo.id === id ? { ...todo, text: newText } : todo);
        renderTodos();
    }
}

// Function to delete a to-do
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    renderTodos();
}

// Function to show comments modal
function showComments(todoId) {
    currentTodoId = todoId;
    const todo = todos.find(todo => todo.id === todoId);

    if (!todo) return;

    const commentList = document.getElementById('comment-list');
    commentList.innerHTML = '';

    todo.comments.forEach((comment, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${comment}</span>
            <div class="actions">
                <button class="edit" onclick="editComment(${index})">Edit</button>
                <button class="delete" onclick="deleteComment(${index})">Delete</button>
            </div>
        `;
        commentList.appendChild(li);
    });

    document.getElementById('comment-modal').style.display = 'block';
}

// Function to close the comments modal
function closeModal() {
    document.getElementById('comment-modal').style.display = 'none';
}

// Function to add a new comment
function addComment() {
    const newCommentText = document.getElementById('new-comment').value;
    if (newCommentText && currentTodoId) {
        const todo = todos.find(todo => todo.id === currentTodoId);
        if (todo) {
            todo.comments.push(newCommentText);
            document.getElementById('new-comment').value = '';
            showComments(currentTodoId);
        }
    } else {
        alert('Please enter a comment.');
    }
}

// Function to edit a comment
function editComment(commentIndex) {
    const newCommentText = prompt('Enter new text for the comment:');
    if (newCommentText && currentTodoId !== null) {
        const todo = todos.find(todo => todo.id === currentTodoId);
        if (todo) {
            todo.comments[commentIndex] = newCommentText;
            showComments(currentTodoId);
        }
    }
}

// Function to delete a comment
function deleteComment(commentIndex) {
    if (currentTodoId !== null) {
        const todo = todos.find(todo => todo.id === currentTodoId);
        if (todo) {
            todo.comments.splice(commentIndex, 1);
            showComments(currentTodoId);
        }
    }
}
