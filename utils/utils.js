const { default: axios } = require("axios");
const cheerio = require("cheerio");

function generateResponse(data = "", code = 200, msg = "success") {
  return {
    code,
    msg,
    data,
  };
}

async function grabWordFromCambridge(word) {
  let url = `https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${word}`;
  let r = await axios.get(url);
  const $ = await cheerio.load(r.data);
  let count = $(".entry-body__el").length;
  let entryBodyElList = [];
  for (var i = 0; i < count; i++) {
    entryBodyElListObj = { dsenseObjList: [] };
    let word = $(".entry-body__el")
      .eq(i)
      .children(".pos-header")
      .find(".headword");
    let property = $(".entry-body__el")
      .eq(i)
      .children(".pos-header")
      .find(".posgram");
    let phonetic = $(".entry-body__el")
      .eq(i)
      .children(".pos-header")
      .find(".dpron");
    entryBodyElListObj.name = word.text();
    entryBodyElListObj.property = property.text();
    entryBodyElListObj.phonetic = phonetic.text();
    // dsenseObjCount计算的是有多少个dsense
    let dsenseObjCount = $(".entry-body__el")
      .eq(i)
      .children(".pos-body")
      .children(".dsense").length;

    for (var j = 0; j < dsenseObjCount; j++) {
      // 代表每个dsense,每个dsense里面又会包含多个phraseBlock和多个defBlock
      dsenseObj = { phraseBlockObjList: [], defBlockObjList: [] };
      // 每个.desense下面还会有多个块(包括def-block和phrase-block)，算综合个数，然后再去进行循环。
      // 计算总共有多少个
      let totalCount = $(".entry-body__el")
        .eq(i)
        .children(".pos-body")
        .children(".dsense")
        .eq(j)
        .find(".sense-body")
        .children()
        .not(".daccord").length;
      // 计算有多少个phrase-block
      let phraseBlockCount = $(".entry-body__el")
        .eq(i)
        .children(".pos-body")
        .children(".dsense")
        .eq(j)
        .find(".sense-body > .phrase-block").length;
      // 计算有多少个def-block
      let defBlockCount = $(".entry-body__el")
        .eq(i)
        .children(".pos-body")
        .children(".dsense")
        .eq(j)
        .find(".sense-body > .def-block").length;
      // TODO: 循环遍历 phraseBlockList

      // #region phrase-block
      for (
        var phraseBlockIndex = 0;
        phraseBlockIndex < phraseBlockCount;
        phraseBlockIndex++
      ) {
        let phraseBlockObj = { en: "", zh: "", phrase: "", sentence: [] };
        let phraseContent = $(".entry-body__el")
          .eq(i)
          .children(".pos-body")
          .children(".dsense")
          .eq(j)
          .find(".sense-body > .phrase-block")
          .eq(phraseBlockIndex)
          .find(".phrase-head")
          .find(".phrase-title");
        phraseBlockObj.phrase = phraseContent.text();
        let phraseEnContent = $(".entry-body__el")
          .eq(i)
          .children(".pos-body")
          .children(".dsense")
          .eq(j)
          .find(".sense-body > .phrase-block")
          .eq(phraseBlockIndex)
          .find(".phrase-body")
          .find(".ddef_h")
          .find(".ddef_d");
        phraseBlockObj.en = phraseEnContent.text();
        let phraseZhContent = $(".entry-body__el")
          .eq(i)
          .children(".pos-body")
          .children(".dsense")
          .eq(j)
          .find(".sense-body > .phrase-block")
          .eq(phraseBlockIndex)
          .find(".phrase-body")
          .find(".def-body")
          .children()
          .eq(0);
        let phraseSentenceCount = $(".entry-body__el")
          .eq(i)
          .children(".pos-body")
          .children(".dsense")
          .eq(j)
          .find(".sense-body > .phrase-block")
          .eq(phraseBlockIndex)
          .find(".phrase-body")
          .find(".def-body")
          .find(".examp").length;
        phraseBlockObj.zh = phraseZhContent.text();
        dsenseObj.phraseBlockObjList.push(phraseBlockObj);
        for (
          var phraseSentenceIndex = 0;
          phraseSentenceIndex < phraseSentenceCount;
          phraseSentenceIndex++
        ) {
          phraseBlockObj.sentence.push(
            $(".entry-body__el")
              .eq(i)
              .children(".pos-body")
              .children(".dsense")
              .eq(j)
              .find(".sense-body > .phrase-block")
              .eq(phraseBlockIndex)
              .find(".phrase-body")
              .find(".def-body")
              .find(".examp")
              .eq(phraseSentenceIndex)
              .text()
          );
        }
      }
      // #endregion

      // #region def-block
      // 循环遍历def-block
      for (
        var defBlockIndex = 0;
        defBlockIndex < defBlockCount;
        defBlockIndex++
      ) {
        let defBlockObj = { en: "", zh: "", sentence: [] };
        let defBlockInnerContent = $(".entry-body__el")
          .eq(i)
          .children(".pos-body")
          .children(".dsense")
          .eq(j)
          .find(".sense-body > .def-block")
          .eq(defBlockIndex)
          .find(".ddef_d");
        defBlockObj.en = defBlockInnerContent.text();
        let defBlockInnerZHContent = $(".entry-body__el")
          .eq(i)
          .children(".pos-body")
          .children(".dsense")
          .eq(j)
          .find(".sense-body > .def-block")
          .eq(defBlockIndex)
          .find(".ddef_b")
          .children()
          .eq(0);
        defBlockObj.zh = defBlockInnerZHContent.text();
        let defBlockInnerSentenceCount = $(".entry-body__el")
          .eq(i)
          .children(".pos-body")
          .children(".dsense")
          .eq(j)
          .find(".sense-body > .def-block")
          .eq(defBlockIndex)
          .find(".ddef_b")
          .find(".examp").length;

        for (
          var sentenceInnerIndex = 0;
          sentenceInnerIndex < defBlockInnerSentenceCount;
          sentenceInnerIndex++
        ) {
          let defBlockInnerSentenceContent = $(".entry-body__el")
            .eq(i)
            .children(".pos-body")
            .children(".dsense")
            .eq(j)
            .find(".sense-body > .def-block")
            .eq(defBlockIndex)
            .find(".ddef_b")
            .find(".examp")
            .eq(sentenceInnerIndex);
          defBlockObj.sentence.push(defBlockInnerSentenceContent.text());
        }

        dsenseObj.defBlockObjList.push(defBlockObj);
      }
      // #endregion
      entryBodyElListObj.dsenseObjList.push(dsenseObj);
    }

    entryBodyElList.push(entryBodyElListObj);
  }
  return entryBodyElList;
}

module.exports = { generateResponse, grabWordFromCambridge };
