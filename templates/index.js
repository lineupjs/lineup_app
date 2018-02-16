const data = document.querySelector('#data').textContent;
const parsed = Papa.parse(data, {
  dynamicTyping: true,
  header: true,
  skipEmptyLines: true
});

const lineup = LineUpJS.asLineUp(document.body, parsed.data, ...parsed.meta.fields);
