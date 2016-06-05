# AWS Environment

## EC2
- 1 x t2.micro (webserver) - application - port 3000 from loadbalancer

## RDS
- 1 x db.t2.micro (spotvenue) - port 3306 from webserver

## Loadbalancer
- webserver - port 80 and 443 from world

## Route 53
- spotvenue.tk
    - NS
    - SOA (?)
    - A: spotvenue.tk -> loadbalancer
    - CNAME: www.spotvenue.tk -> spotvenue.tk

## S3
- spotvenue
    - root: processed videos
    - "original": original videos
    - "preview": preview image
