# osrm-decentralized
Browse on github: [https://github.com/osrm-decentralized](https://github.com/osrm-decentralized)

## [See Demo page](demo) featuring various independent OSRM servers

## Roll your own road routing software!
We're using the fabulous [OSRM Project](http://project-osrm.org/), a free, open source routing software that runs on [Openstreetmap](https://www.openstreetmap.org/) data and is a great self-hostable alternative to expensive propriertary mapping services. Raise your organisation's bottom line by moving to open source.

To reduce difficulty in running for custom areas, we've crafted some Docker recipes (docker build, docker run and voila!) that should enable anyone to set up their own OSRM instance for their own region. You can run these on your local machine as well as on the cloud.

## Decentralized
That's the key to running things fast and light. Don't bother trying to run an OSRM for the whole planet - what's the point? Large base areas = huge RAM and processor requirements = too expensive! Instead, figure out your region on which you want to run this. Check out the repos in our [github org](https://github.com/osrm-decentralized).

- **[osrm_custom_pbf](https://github.com/osrm-decentralized/osrm_custom_pbf)** : Got your own openstreetmap data in .pbf format? Got it from geofabrik? Then you can start off here. (Looking for Indian states? We've [got you covered](https://server.nikhilvj.co.in/dump/)!)
- **[osrm_custom_poly](https://github.com/osrm-decentralized/osrm_custom_poly)** : Have a specific area like a city or a limited region defined by a shapefile? Use this.


## Customize profiles
OSRM uses configurations in .lua files to do its computations. There's all sorts of options like what kind of roads are pliable and what not; what should be the assumed speeds for various kinds of roads, whether to include wait time at turns, whether left side driving or right, etc etc. We can fine-tune these settings to deliver more accurate routing results for our area. (This is excluding live traffic, note, that's another topic).

Some customization for Indian roads has been done here: [osrm_profiles_india](https://github.com/osrm-decentralized/osrm_profiles_india). Inviting collaboration to work on this further.