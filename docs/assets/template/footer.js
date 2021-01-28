const YEAR_FOOTER = new Date().getFullYear();
const PAGE_LINK = "diegoinacio.github.io";

document.querySelector("footer#footer").innerHTML = `
<p class="copyright">
  © ${YEAR_FOOTER} Diego Inácio. <br />
  <a href="https://${PAGE_LINK}/" target="_blank">${PAGE_LINK}</a>
</p>
`;
