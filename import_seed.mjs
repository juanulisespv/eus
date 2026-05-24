import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://okoqgrrspwxaonbyfkxf.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is not defined in the environment.')
  console.error('Por favor ejecuta el script con: node --env-file=.env.local import_seed.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const words = JSON.parse(readFileSync('./data/words_seed.json', 'utf8'))

const categoryMap = {
    'saludos': 'saludo',
    'numeros': 'numero',
    'pronombres': 'pronombre',
    'verbos': 'verbo',
    'lugares': 'sustantivo',
    'familia': 'sustantivo',
    'comida': 'sustantivo',
    'descripciones': 'adjetivo'
}

function getWordCategory(w) {
    if (categoryMap[w.category]) {
        return categoryMap[w.category];
    }
    if (w.category === 'tiempo') {
        if (['egun', 'ordu', 'aste', 'hilabete', 'urte', 'goiz', 'gaua'].includes(w.word_eu)) {
            return 'sustantivo';
        }
        return 'adverbio';
    }
    if (w.category === 'conectores') {
        if (['eta', 'baina'].includes(w.word_eu)) return 'conjuncion';
        if (['zer', 'nor'].includes(w.word_eu)) return 'pronombre';
        if (['non', 'noiz', 'nola', 'zergatik', 'zenbat'].includes(w.word_eu)) return 'adverbio';
        return 'adjetivo';
    }
    return 'otro';
}

const cleaned = words.map(w => ({
    word_eu: w.word_eu === 'goxoo' ? 'goxo' : w.word_eu,
    translation_es: w.translation_es,
    translation_en: w.translation_en ?? null,
    category: getWordCategory(w),
    difficulty: w.difficulty,
    frequency_rank: w.frequency_rank,
    pronunciation: w.pronunciation ?? null,
    definition_simple: w.definition_simple ?? null,
    uso_habitual: w.uso_habitual ?? null,
    tags: w.tags ?? [],
    is_active: w.is_active ?? true,
}))

console.log(`Upserting ${cleaned.length} words to 'words' table...`)
const { data: insertedWords, error: wordsError } = await supabase
    .from('words')
    .upsert(cleaned, { onConflict: 'word_eu' })
    .select('id, word_eu')

if (wordsError) {
    console.error('❌ Error updating words:', wordsError.message)
    console.error('Detalle:', wordsError.details)
    process.exit(1)
}

console.log(`✅ Upsert exitoso. Procesando ejemplos...`)

const wordIdMap = {};
for (const iw of insertedWords) {
    wordIdMap[iw.word_eu] = iw.id;
}

const examplesToInsert = []
for (const w of words) {
    const wordEuCleaned = w.word_eu === 'goxoo' ? 'goxo' : w.word_eu;
    const wordId = wordIdMap[wordEuCleaned];
    if (!wordId) continue;

    if (w.frase_1_eu && w.frase_1_es) {
        examplesToInsert.push({
            word_id: wordId,
            sentence_eu: w.frase_1_eu,
            sentence_es: w.frase_1_es,
            sentence_en: null,
            display_order: 1,
            source: 'manual',
        })
    }

    if (w.frase_2_eu && w.frase_2_es) {
        examplesToInsert.push({
            word_id: wordId,
            sentence_eu: w.frase_2_eu,
            sentence_es: w.frase_2_es,
            sentence_en: null,
            display_order: 2,
            source: 'manual',
        })
    }
}

const wordIds = insertedWords.map(w => w.id)
console.log(`Eliminando ejemplos antiguos para ${wordIds.length} palabras...`)
const { error: deleteExamplesError } = await supabase
    .from('examples')
    .delete()
    .in('word_id', wordIds)

if (deleteExamplesError) {
    console.error('❌ Error al eliminar ejemplos antiguos:', deleteExamplesError.message)
}

console.log(`Insertando ${examplesToInsert.length} frases de ejemplo...`)
const { error: examplesError } = await supabase
    .from('examples')
    .insert(examplesToInsert)

if (examplesError) {
    console.error('❌ Error al insertar ejemplos:', examplesError.message)
    console.error('Detalle:', examplesError.details)
} else {
    console.log(`✅ Importación completa y exitosa: ${cleaned.length} palabras y ${examplesToInsert.length} ejemplos.`)
}