const meElement = document.querySelector("[data-me]")

const getAccessToken = async () => {
    const resp = await axios.get('/refresh_token')
    return resp.data.token_type === 'bearer' ? resp.data.access_token : null
}

const getMe = async () => {
    const access_token = await getAccessToken()
    const resp = await axios.get('/users/me', {headers: {Authorization: `Bearer ${access_token}`}})
    return resp.data
}

const renderIndex = async () => {
    try {
        const me = await getMe()
        console.log(me)
        meElement.innerText = me.username
    } catch (e) {
    }
}

renderIndex()
