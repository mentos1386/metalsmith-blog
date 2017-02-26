---
title: Let's Encrypt Nginx
author: mentos1386
tags:
 - Let's Encrypt
 - Security
 - Nginx
---

# Introduction
As we all know, privacy and security is important, so why stick with old HTTP when you can use HTTPS. Oh, it's just a hobby project and you don't want to pay for expansive TLS/SSL certificates?  It's to hard to make HTTPS work?

Well, there exists service that gives you TLS/SSL certificate for free! And it works with every modern browser. How do you use it you ask? Well, it's not that hard at all.

<!-- more -->

Let's Encrypt is a new Certificate Authority (CA) that provides an easy way to obtain and install free TLS/SSL certificates, thereby enabling encrypted HTTPS on web servers. It simplifies the process by providing a software client, CertBot, that attempts to automate most (if not all) of the required steps.

Currently, the entire process of obtaining and installing a certificate is fully automated only on Apache web servers. However, Let's Encrypt can be used to easily obtain a free SSL certificate, which can be installed manually, regardless of your choice of web server software.

![Let's Encrypt with Nginx](https://assets.digitalocean.com/articles/letsencrypt/nginx-letsencrypt.png "Courtesy of DigitalOcean")

# Prerequisites
You will be needing a domain name that you wish to use certificate with and an A/AAA Record that points your domain to the public IP address of your server.

This is required because of how Let's Encrypt validates that you own the domain it is issuing a certificate for. For example, if you want to obtain a certificate for example.com, that domain must resolve to your server for the validation process to work.

# CertBot
As whole service is automated and there isn't any people involved. First you need to download CertBot, which is a client for Let's Encrypt. With it you can get your certificates.

There are packages for some distributions, for others you just need to download the program from the web.

## Installation

### Ubuntu 16.04
```bash
$ sudo apt-get install letsencrypt
```
### Ubuntu 16.10
```bash
$ sudo apt-get install certbot
```
### CentOS 6
```bash
$ wget https://dl.eff.org/certbot-auto
$ chmod a+x certbot-auto
```
### CentOS 7
```bash
$ sudo yum install certbot
```
### Debian 7
```bash
$ wget https://dl.eff.org/certbot-auto
$ chmod a+x certbot-auto
```
### Debian 8
```bash
$ sudo apt-get install certbot -t jessie-backports
```

## Usage
Usage slightly depends on your distribution, on Ubuntu 16.04 you would use `letsencrypt` to run it while on Ubuntu 16.10 and Debian 8 you would use `certbot`, on CentOS 6 and Debian 7 you would need to be inside directory you downloaded it and use `./certbot-auto`, or `/path/to/certbot-auto` if you are in some other directory.

> **Pro tip:** CertBot has very good documentation located [Here](https://certbot.eff.org)


# Nginx
In this tutorial we will use Nginx as our web server that will verify us as owners of a domain for which we want certificates. We could use some other web server (Apache) but i have never worked with others :)

## Configuration

All Nginx configuration files are located at `/etc/nginx`
> **Pro tip:** On Linux, configuration files are usually located at `/etc/SoftwareName`

First we need to create new file, where we will store our own configuration.

```bash
$ nano /etc/nginx/conf.d/our.domain.com.conf
```

In this file you should write something like this
```nginx
server {
    listen 80;
    server_name our.domain.com;

    # This location is used for domain verification
    location /.well-known/acme-challenge/ {        
        root /var/www/letsencrypt/;
    }

    # Force HTTPS
    # This redirect all other traffic to the same url, but with HTTPS instead of HTTP
    return 301 https://$host$request_uri;
}
```
As you can see, we are going to route all requests to `http://our.domain.com/.well-known/acme-challenge` to `/var/www/letsencrypt/` folder.
> **Pro tip:** in  `/var/www` folder,  is there are usually websites and other web accessed files. 

We need to first create that folder
```bash
$ mkdir /var/www/letsencrypt
```
And reload Nginx, so that it will use our new configuration file.
```bash
$ sudo systemctl reload nginx
```
> **Pro tip:** If for some reason anything doesn't work with nginx, you can check what's going wrong with `sudo systemctl status nginx` or `journalctl -xfu nginx` where `x` gives some explanatory text, `f` live updates and `u` means you will be looking for log of a `systemd` service.

## Obtaining Certificate
Now we can finally obtain our SSL Certificate.
```bash
$ certbot certonly --webroot -w /var/www/letsencrypt -d our.domain.com
```
Explaning command:

- `certbot`. You should use proper command for your Distro, as explaind in `CertBot -> Usage` 
- `-w`. This is location where temporary files for verification are going to be stored (can be used for multiple domains).
- `-d`. With `-d` parameter we can add as many domains as we want to get Certificate for.

If you command finished without errors, your certificates should now be located at `/etc/letsencrypt/live/our.domain.com/` (could be different on some distros) . 

## Nginx with HTTPS
To make Nginx use of our new certificate, you need to append following to our previous configuration file  `/etc/nginx/conf.d/our.domain.com.conf`
```nginx
server {
    # Server listening on 443 (ssl)
    listen 443 ssl;
    server_name our.domain.com;

    # Define which certificates it will use
    ssl_certificate /etc/letsencrypt/live/our.domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/our.domain.com/privkey.pem;

    # We define which protocols/encryption mechanisms we support/prioritize
    # It's important, as we don't want to support some vulnerable protocols like SSL2/SSL3
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;
    ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
    ssl_ecdh_curve secp384r1; # Requires nginx >= 1.1.0
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off; # Requires nginx >= 1.5.9
    ssl_stapling on; # Requires nginx >= 1.3.7
    ssl_stapling_verify on; # Requires nginx => 1.3.7

    # This option, will make browser remember that it accessed your website through HTTPS, and will enforce only HTTPS conection from now on (or fail if HTTPS isn't available)
    # This is also great for security, as users can't be redirected to HTTP version of site
    # Use with caution, if you ever disable HTTPS all users that connected when this header was active, won't be able to connect to HTTP site.
    add_header Strict-Transport-Security "max-age=63072000; always";

    # Whatever you do next it's up to you, something like this would look like if we would have NodeJS server that we want to route traffic to
    location / {
        proxy_pass http://127.0.0.1:3015/;
    }
}
```
All you have to do now, is reload Nginx, and try it out.
```bash
$ sudo systemctl reload nginx
```
# Conclusion
If you want to read more on how to better secure your website with HTTPS, you can read this couple of links:
 - [Strong SSL Security on nginx](https://raymii.org/s/tutorials/Strong_SSL_Security_On_nginx.html)
 - [Strong Ciphers for Apache, nginx and Lighttpd](https://cipherli.st)
 - [How To Secure Nginx with Let's Encrypt on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04)
