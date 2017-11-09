---
title : IPFS CLoud
author: mentos1386
tags  : IPFS, IPNS, Storage, Cloud, Privacy, Anonymity, Idea
---

An idea, how i would/will create a cloud storage service using IPFS as a storage/distribution system. Something like [OwnCloud](https://owncloud.com)/[NextCloud](https://nextcloud.com) on the IPFS. Everything (accounts/files) would be hosted in IPFS, no reliance on external services. 

<!-- more -->

### Features

 * Works without "Internet". Can be created in own intronets.
 * Without any centralized authority
 * Impossible to censor, take down
 * Possibility to give away your hard drive to mirror other users files.
 * Keep multiple devices in sync even with changes done offline.
 * Possibility to share files after uploading them
 * Possibility to share files with specific accounts before uploading them
 * Keep a history of changes? (as long as someone still has the files)

## Accounts

Account created by generating private/public key. Private key is used for encryption, public key is used for locating user's files, sharing files.

If you would have account setup on device A and would want to set it up on device B, all you would have to do is scan a QR code that would be shown in device A screen.

## Files

Encrypted with symmetric encryption.

One key is encrypted once with account's private key. For personal use.

Another with a key generated from file hash and account private key, to be shared with others, so that they can access file (public). Can be generated from each file after it was uploaded. Need to make sure that we can't some how reproduce private key from generated key and hash. Has to be one way only.

Add an option to encrypt with other public keys at encryption time, to share with specific accounts.

Each file would also have a hash of previous version, so we can track changes (visible without decrypting?).
 (public)
### Distributing of account files list

Encrypted list of all the hashes for specific public key. Published on IPFS but with static IPNS. Each file would have a hash that would link it with previous one, this way user could go back in history and see removed/modified files, but only if those files are still hosted on at least one machine.

Make a public version of account file list. So that other devices can discover your files and re-share them.

## Conclusion

With everything being on IPFS, implementation shouldn't be too hard. The most challenging would be encryption, as we don't have to care about distribution. Thanks IPFS! With open specification, there cold be all kinds of clients built on top of this.
