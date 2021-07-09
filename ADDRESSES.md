# Contributing Guide

- [Introduction](#introduction)
- [What is the Address Resource?](#what-is-the-address-resource)
- [To and From](#to-and-from)

## Introduction

The address model structure is one of the most complex in the entire repository,
given its pattern of inheritance and the number of places in which it's used. That's
why it gets its own README!

## What is the Address Resource?

The address resource is a way to create and store both US & International addresses,
usually for the purpose of utilising them to send a mailpiece. Each address object
has a unique ID, and while the US & International models are similar, their required
fields differ enough to split them out.

## To and From

The "to" and "from" fields which are present in mailpieces manifest as address objects.
When creating a mailpiece, they can be filled by either an address ID (a unique hash
associated with a particular address object) or an inline address object, which has its
own models (`shared/models/address/inline_address.yml`). In the response, however, it's
populated by a chain of models which can be slightly difficult to understand at first
glance. The following chart aims to explain the hierarchy a bit:

├── resources
│ ├── postcards # elements specific to postcards
│ │ ├── postcards.yml  
│ │ ├── postcard.yml # contains a reference to `responses/postcard.yml`
│ │ └── attributes
│ │ └── ...
│ │ ├── models
│ │ ├── postcard_base.yml
│ │ ├── postcard_editable.yml
│ │ └── postcard.yml # contains references to `shared/models/form_factor/generated.yml` ("to" field) & `shared/models/form_factor/from_us.yml` ("from" field)
│ │ └── responses
│ │ ├── postcard.yml # contains a reference to `models/postcard.yml`
│ │ └── all_postcards.yml
├── shared # elements used by multiple resources
│ ├── models # properties of type `object`
│ │ ├── form_factor
│ │ ├── generated.yml # contains a reference to `shared/models/address/address.yml │ │ └── from_us.yml # contains a reference to `shared/models/address/address_us.yml
│ │ ├── address
│ │ ├── address.yml # contains a oneOf selector between `address_us.yml` and `address_intl.yml`
│ │ ├── address_us.yml # base file which contains the requirements and properties for US address objects
│ │ ├── address_intl.yml # base file which contains the requirements and properties for international address objects
│ │ └── ...
