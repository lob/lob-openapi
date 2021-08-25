function getId(host) {
  if (host.includes("netlify")) {
    return "16a23fe0-c29a-48ec-a531-5123fd9f60bf";
  } else if (host.includes("docs.lob.com")) {
    return "3880e815-fdf3-402b-a04d-ed45c446e9b3";
  } else if (host.includes("github")) {
    return "287dd3d3-4e55-457b-bd44-25bd34f0cbd9";
  } else {
    return null;
  }
}
