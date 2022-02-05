const navLoggedInElement = document.querySelector("[data-nav-loggedIn]");
const navLoggedOutElement = document.querySelector("[data-nav-loggedOut]");
const pluginsContainerElement = document.querySelector("[data-plugins-container]");

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
        const me = await getMe()
        renderLoggedIn(me)
    } catch (e) {
        renderLoggedOut()
    }
}

const renderLoggedIn = (me) => {
    navLoggedOutElement.remove()
    navLoggedInElement.hidden = false

    if (me.is_admin) {
        const linkContainer = document.querySelector("[data-link-container]")
        const usersLink = document.createElement("a")
        usersLink.className = "btn btn-primary text-white mr-sm-2"
        usersLink.textContent = "Users"
        usersLink.href = "/user"

        linkContainer.insertBefore(usersLink, linkContainer.querySelector(":first-child"))
    }
    const meElement = document.querySelector("[data-me]");
    meElement.textContent = me.username
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
        pluginsHeader.textContent = 'Folgende Plugins sind installiert'
        pluginsContainerElement.appendChild(pluginsHeader);
    }

    plugins.forEach(plugin => {
        let routeElements = ''
        for (const route of plugin.routes) {
            routeElements += `<li><a href="${route}">${route}</a></li>`
        }

        const pluginContainer = document.createElement('div');
        pluginContainer.innerHTML = `
        <h3>${plugin.name}</h3>
        ${routeElements ? "<ul>" + routeElements + "</ul>" : ""}
        `
        pluginsContainerElement.appendChild(pluginContainer);
    })
}

const renderIndex = async () => {
    await renderIsLoggedIn()
    await renderPlugins()
}

renderIndex()
