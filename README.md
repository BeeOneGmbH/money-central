money-central
=============

MONEY Centralized Database | __“MONEY – Your Financial Health Check”__

The _MONEY Centralized Database_ — henceforth referred to as _MONEYcDB_ — is a central data exchange platform for the [MONEY Web Application](https://github.com/BeeOneGmbH/money) created by [BeeOne](http://www.beeone.at/) in Vienna, Austria for a core group of the European members of WSBI (World Savings and Retail Banks Institute) and ESBG (European Savings and Retail Banking Group).


Preparation
-----------

MONEYcDB can be hosted on a Linux or Windows server. There are no actual minimum requirements, but as a recommendation: 1.6GHz CPU, 1.75GB RAM, 10GB Storage. These minimum requirements would only apply if the machine would be set up and used solely for the MONEYcDB. However, it is more likely that the database will be installed on existing hardware. Therefore the components listed as follows will only be needed if not already present.

### Preparing the infrastructure

* `MongoDB` ([http://www.mongodb.org/](http://www.mongodb.org/)) will be used for storing data:
  [http://docs.mongodb.org/manual/installation/](http://docs.mongodb.org/manual/installation/)
* `nodejs` ([http://nodejs.org/](http://nodejs.org/)) will be used to serve the API that allows local installations of the MONEY Web Application to communicate with the MONEYcDB:
  [http://nodejs.org/download/](http://nodejs.org/download/)
* `npmjs` ([https://npmjs.org/](https://npmjs.org/)) will be needed to ensure that all additionally required software packages can be retrieved. `npmjs` should be already installed once you have `nodejs` installed.

Given that the installation process will be different as it depends on the operating system you have on your server, please install the infrastructure components by following the referenced guides.

Local installations of the MONEY web application will communicate with the MONEYcDB over a secure connection, therefore you need to obtain an SSL certificate, if you do not have one already.

With the components and the certificate, you should be able to get the MONEYcDB running. In addition, a web server (Apache2, nginx, or similar) is needed to make the MONEYcDB available to the outside world. The database could be set up using a dedicated subdomain (e.g. https://moneycdb.example.com/) or it could be mapped to a directory (e.g. https://my.example.com/money-central/). You will find information on how to configure the web server in the last chapter. First we need to install MONEYcDB itself.


Installing the software
-----------------------

Before you proceed, make sure that the infrastructure components from the previous chapter are up and running, to avoid having to deal with a problem that originates from those components and has little or nothing to do with the installation of the MONEYcDB itself.

The following instructions target *nix environments, but they apply to Windows in a similar fashion. You have to take into account that many of the referenced command line tools (e.g. `git`) are already installed on Linux, whereas on a Windows server they need to be installed manually.

### Downloading the source code

Choose a location on your server’s hard disk where you would like to store the MONEYcDB source code, and switch into this directory.

```bash
cd /path/to/moneycdb
```

You could now download the source by following the link below and download a ZIP file, but we recommend doing it by simply cloning the github repository.

```bash
git clone https://github.com/BeeOneGmbH/money-central .
```

Notice the extra space and dot at the end. If you omit it, a directory named `money-central` will be created for you within your current directory, which will then contain the source code.

After successful download, your directory contains – among other things – a file named `package.json`, where additionally required plugins are listed. You’ll install them using the node package manager.

```bash
npm install
```

Once the node package manager has successfully downloaded the plugins, you’re done.


Configuring the software
------------------------

All the steps described in this chapter are optional. You could run MONEYcDB right out of the box, but administrators could use the information found here to fine-tune the installation.

In your MONEYcDB home directory you could create a file named `settings.json`, which would allow you to override the default behavior of MONEYcDB. A simple version could look like this.

```json
{
	"port": 1234
}
```

Whatever the content might be, it has to be a valid JSON file ([http://jsonlint.com/](http://jsonlint.com/)). In case you decide to override all possible options, this file’s content could look like as follows.

```json
{
	"port": 5678,
	"path": "/some/path",
	"database": {
		"host": "127.0.0.1",
		"port": 27017
	}
}
```

The `port` allows you to define a specific port for the MONEYcDB itself. Unless specified otherwise, the default port is 8080.

Although we do not recommend it, you could also specify a path, depending on how you choose MONEYcDB to be made available to the outside world. If MONEYcDB will be available via a URL such as https://moneycdb.example.com/, you do not need to add a path, which is the default behavior. On the other hand, in order to host it with a URL like https://my.example.com/money-central/, you need to set “/money-central” as the path.

In case your installation of `MongoDB` has not been set up with default parameters, or if it is even installed on a different server, you might want to specify a database entry – containing a host name and a port number – which MONEYcDB should use to connect to the database. The values shown above are the aforementioned defaults for both `MongoDB` and MONEYcDB. So unless specified otherwise, MONEYcDB uses 127.0.0.1:27017 when trying to connect to `MongoDB`.

In short: in case you need to override at least one default entry, create a `settings.json` file.


Running the software
--------------------

If you are in your MONEYcDB home directory, you could now run it for testing purposes.

```bash
node money-central.js
```

If you do not get an error message, you’ll end up with some output lines, the final one should start with “Express server listening…” – this means that so far everything has been installed and configured correctly.

It is recommended to use `forever` ([https://github.com/nodejitsu/forever#readme](https://github.com/nodejitsu/forever#readme)) to keep the MONEYcDB up and running, which can be installed via node package manager.

```bash
sudo npm install -g forever
```

However, `forever` only restarts MONEYcDB after something unexpected happens within the application. In order to restart it even after your server has been restarted, you need to add the following to one of your start scripts or to the server’s crontab as a `@reboot` entry, or similar.

```bash
forever start --minUptime 10000 -a -l /path/to/moneycdb/logs/forever.log -o /path/to/moneycdb/logs/out.log -e /path/to/moneycdb/logs/err.log /path/to/moneycdb/money-central.js
```

This is also the recommended way you want to start MONEYcDB. You might want to put this in a shell script. Once started like this, you could perform a check, to see if the installation is responding.

```bash
curl -v http://localhost:your-port-number/
```

This should deliver the HTTP status code 200 OK.
