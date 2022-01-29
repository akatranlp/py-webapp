const navbar = document.querySelector("[data-navbar]");

class UserData {
    constructor(token) {
        this.token = token
    }

    getMe = async () => {
        const resp = await axiosInstance.get('/users/me')
        return resp.data
    }
}

const getAccessToken = async () => {
    try {
        // Hier wird normales axios genutzt,
        // da der sonst der interceptor ausgeführt wird und wir uns unendlich im Kreis drehen
        const resp = await axios.get('/refresh_token')
        return resp.data.token_type === 'bearer' ? resp.data.access_token : null
    } catch (e) {
        window.location = '/login'
        return null
    }
};

// Source: https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
const parseJwt = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

const isTokenValid = (token) => {
    const parsedToken = parseJwt(token);
    return parsedToken.exp ? parsedToken.exp > (Date.now() / 1000) : true
};

export const user = new UserData(await getAccessToken())

export const axiosInstance = axios.create({
    baseURL: '/',
    timeout: 1000,
    headers: {Authorization: `Bearer ${user?.token}`}
});

axiosInstance.interceptors.request.use(async req => {
    if (!isTokenValid(user.token))
        user.token = await getAccessToken()
    req.headers.Authorization = `Bearer ${user?.token}`
    return req
});

const init = async () => {
    const currentUser = await user.getMe()
    if (!navbar)
        return
    navbar.innerHTML = `
    <!-- Logindaten -->
    <div class="row pl-3">
        <a class="btn btn-primary text-white mr-sm-2" href="/">Startseite</a>
        <a class="btn btn-danger text-white mr-sm-2" href="/logout">Ausloggen</a>
        <a class="btn btn-secondary text-white mr-sm-2" href="/account">Einstellungen</a>
        <div>
            <p class="text-white text-justify m-2 mr-4">Eingeloggt als:
                <b class="text-white" id="loggedUser">${currentUser.username}</b>
            </p>
        </div>
    </div>
    <!-- Kalender und Adressbuch -->
    <div>
        ${currentUser.is_admin ? '<a class="btn btn-primary text-white mr-sm-2" href="/user">Users</a>' : ''}
        <a class="btn btn-primary text-white mr-sm-2" href="/">Startseite</a>
        <a class="btn btn-info mr-sm-2" href="/todo">ToDo-Liste</a>
        <a class="btn btn-success text-white mr-sm-2" href="/calendar">Kalender</a>
        <a class="btn btn-warning mr-sm-2" href="/contact">Adressbuch</a>
    </div>
    `
}

init()
