const navLoggedInElement = document.querySelector("[data-nav-LoggedIn]");
const navLoggedOutElement = document.querySelector("[data-nav-LoggedOut]");
const pluginsContainerElement = document.querySelector("[data-plugins-container]");

let me;

const getAccessToken = async () => {
    const resp = await axios.get('/refresh_token')
    return resp.data.token_type === 'bearer' ? resp.data.access_token : null
}

const getMe = async () => {
    const access_token = await getAccessToken()
    const resp = await axios.get('/users/me', {headers: {Authorization: `Bearer ${access_token}`}})
    return resp.data
}

const renderIsLoggedIn = async () => {
    try {
        me = await getMe()
        renderLoggedIn()
    } catch (e) {
        me = null
        renderLoggedOut()
    }
}

const renderLoggedIn = () => {
    navLoggedOutElement.remove()
    navLoggedInElement.hidden = false
    const meElement = document.querySelector("[data-me]");
    meElement.innerText = me.username
}

const renderLoggedOut = () => {
    navLoggedInElement.remove()
    navLoggedOutElement.hidden = false
}

const renderPlugins = async () => {
    const resp = await axios.get('/plugins')
    const plugins = resp.data
    if (plugins.length > 0) {
        const pluginsHeader = document.createElement('h2');
        pluginsHeader.innerText = 'Folgende Plugins sind installiert'
        pluginsContainerElement.appendChild(pluginsHeader);
    }

    plugins.forEach(plugin => {
        let routeElements = ''
        for(const route of plugin.routes) {
            routeElements += `<li><a href="${route}">${route}</a></li>`
        }

        const pluginContainer = document.createElement('div');
        pluginContainer.innerHTML = `
        <h3>${plugin.name}</h3>
        ${routeElements ? "<ul>"+routeElements+"</ul>" : ""}
        `
        pluginsContainerElement.appendChild(pluginContainer);
    })
}

const renderIndex = async () => {
    await renderIsLoggedIn()
    await renderPlugins()
}

renderIndex()
