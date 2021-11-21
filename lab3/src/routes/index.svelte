<script>

  async function fetchGraphQL(operationsDoc, operationName, variables) {
    const result = await fetch(
            "https://lab3todo.herokuapp.com/v1/graphql",
            {
              method: "POST",
              body: JSON.stringify({
                query: operationsDoc,
                variables: variables,
                operationName: operationName
              })
            }
    );

    return result.json();
  }

  const operationsDoc = `
  mutation deleteAllMutation {
    delete_notes(where: {}) {
      affected_rows
    }
  }
  query getDataQuery {
    notes {
      author
      date
      text
      id
    }
  }
  mutation deleteNote($_eq: uuid) {
    delete_notes(where: {id: {_eq: $_eq}}) {
      affected_rows
    }
  }
`;

  function fetchMyQuery() {
    return fetchGraphQL(
            operationsDoc,
            "getDataQuery",
            {}
    );
  }

  function executeDeleteAllMutation() {
    return fetchGraphQL(
            operationsDoc,
            "deleteAllMutation",
            {}
    );
  }

  function executeDeleteNote(_eq) {
    return fetchGraphQL(
            operationsDoc,
            "deleteNote",
            {"_eq": _eq}
    );
  }

  async function startExecuteDeleteNote(_eq) {
    const {errors, data} = await executeDeleteNote(_eq);

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
    }
  }


  async function startFetchMyQuery() {
    const { errors, data } = await fetchMyQuery();

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
    }

    // do something great with this precious data
    console.log(data);
  }
  async function startExecuteDeleteAllMutation() {
    const { errors, data } = await executeDeleteAllMutation();

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
    }
    console.log("Hello");
    // do something great with this precious data
    console.log(data);
  }

  function onDelete (event) {
    const targetElement = event.target;
    startExecuteDeleteNote(targetElement.id);
  }
  startFetchMyQuery();
</script>

<svelte:head>
  <title>Home</title>

</svelte:head>

<div>
  {#await fetchMyQuery()}
    <p>...waiting</p>
  {:then data}
    <p>Totally notes: {data.data.notes.length}</p>
    <button class="btnDeleteAll" on:click={startExecuteDeleteAllMutation} >Delete all</button>
    <ul>
      {#each data.data.notes as {author, date,  text, id}}
        <li>
          <a href="#" class="note">
            <h2><strong>Note</strong></h2>
            <p><strong>Author: {author}</strong></p>
            <p><strong>{text}</strong></p>
            <p><strong>Date: {date}</strong></p>
            <div class="buttonsZone">
              <button class="btnEditSpecific">&#9998</button>
              <button class="btnDeleteSpecific" id="{id}" on:click={event => onDelete(event)}>X</button>
            </div>
          </a>
        </li>
      {/each}
    </ul>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>
