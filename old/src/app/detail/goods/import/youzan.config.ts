const client_id = 'b5db21e87b2afad5d5'
// const client_secret = 'fb0affc602f8993af33e29ad2febfa7'
const redirect_uri = 'http://backend.publish.seecsee.com/api/ng/youzan/authorization'


export default {
  authorize_url: `https://open.youzan.com/oauth/authorize?client_id=${client_id}&response_type=code&state=teststate&redirect_uri=${redirect_uri}`
};
