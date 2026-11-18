"""Roteiro v2 ("E se você parasse de sentir dor?") estruturado por plano.

Cada plano: id, capitulo, cena (descrição visual curta) e falas [(voz, personagem, texto)].
voz A = narradora (Francisca), voz B = personagens e comentários (Antonio).
pausa_antes: silêncio extra antes do plano (s). sfx: efeitos (nome, índice da fala, deslocamento em s).
minimo: duração mínima do plano (s), para montagens e cartelas.
Dadá -> Gotinha em todas as falas. Sem travessão.
"""
PLANOS = [
    # Capítulo 1: A terça em que nada doeu
    dict(id="c1_consultorio", cap=1, falas=[("A", None, "Naquela terça, nada doía. E ninguém achou isso um problema. Ainda.")]),
    dict(id="c1_dedinho", cap=1, falas=[("A", None, "Três semanas antes. Você acorda, levanta... e bate o dedinho do pé na quina da cama.")], sfx=[("quina", 0, -0.9)], pausa_depois=0.3),
    dict(id="c1_nada", cap=1, falas=[("A", None, "Nada.")], pausa_antes=0.6, minimo=2.4),
    dict(id="c1_pecinha", cap=1, falas=[("A", None, "Pisa, de propósito, numa pecinha de montar do seu irmão."), ("B", "caco", "Isso aí dói mais que tudo nesse mundo!"), ("A", None, "Nada de nada.")]),
    dict(id="c1_cascudo", cap=1, falas=[("A", None, "O Caco faz o teste científico dele."), ("B", "caco", "Mãe! A Gotinha quebrou!")], sfx=[("coco", 0, 2.1)], gap=[0.9]),
    dict(id="c1_raro", cap=1, falas=[("A", None, "Tem gente que nasce assim. É raríssimo. Você nasceu assim. Só que ninguém tinha percebido. Até aquela terça.")]),
    dict(id="c1_titulo", cap=1, falas=[("B", None, "E se você parasse de sentir dor?")], pausa_antes=0.5, minimo=4.0),
    # Capítulo 2: Pra que serve a dor
    dict(id="c2_pena", cap=2, falas=[("B", "helena", "Sente?"), ("B", "gotinha", "Sinto.")], minimo=3.2),
    dict(id="c2_clipe", cap=2, falas=[("B", "helena", "E agora?"), ("B", "gotinha", "Sinto que apertou."), ("B", "helena", "O tato está perfeito. A dor, zero.")]),
    dict(id="c2_alarme", cap=2, falas=[("A", None, "Dor é um alarme. Você encosta na panela, o nervo manda o aviso, o cérebro toca a sirene.")], sfx=[("sirene", 0, -1.4)]),
    dict(id="c2_paquistao", cap=2, falas=[("A", None, "Em três famílias do Paquistão, quem nasceu assim tinha o mesmo gene quebrado. Esse gene é a receita de uma comporta que fica no nervo da dor.")]),
    dict(id="c2_comporta", cap=2, falas=[("B", None, "Sem a comporta, o aviso nasce... e morre no caminho.")]),
    dict(id="c2_interfone", cap=2, falas=[("B", None, "Interfone com o fio cortado. Aperta, aperta. Silêncio."), ("A", None, "Sem alarme, as feridas passam sem avisar.")], gap=[0.8]),
    dict(id="c2_mae", cap=2, falas=[("A", None, "Sua mãe fica branca."), ("B", "gotinha", "Posso ir pro futebol?")], gap=[0.6]),
    # Capítulo 3: Uma vida sem dor
    dict(id="c3_vacina", cap=3, falas=[("A", None, "Posto de saúde, dia de vacina. A fila inteira tremendo. Menos você. Você pede pra ver a agulha entrando."), ("B", "gotinha", "Pode pôr outra?"), ("A", None, "Ganha o adesivo de corajosa sem fazer nada.")]),
    dict(id="c3_churrasco", cap=3, falas=[("A", None, "Churrasco de domingo. O Caco aposta o controle do videogame: pimenta dedo-de-moça inteira."), ("A", None, "Você come duas. E pede farofa.")], gap=[1.6]),
    dict(id="c3_pimenta", cap=3, falas=[("B", None, "A pimenta arde porque liga os mesmos nervos que avisam calor. Os seus não atendem.")]),
    dict(id="c3_bolada", cap=3, falas=[("A", None, "Futebol na rua. O Tião chuta de bico. A bola acerta a sua cara."), ("A", None, "A rua inteira congela. Você devolve a bola."), ("B", "tiao", "Você é de pedra?"), ("B", "gotinha", "Sou de quê?")], sfx=[("bola", 0, -0.4)], gap=[1.2]),
    # Capítulo 4: A menina que não cai
    dict(id="c4_viral", cap=4, falas=[("A", None, "O Caco filma. Posta. Dá um milhão. Você vira a menina que não cai.")], sfx=[("plim", 0, -3.2)]),
    dict(id="c4_montagem", cap=4, falas=[("A", None, "Cada vídeo, um teste mais burro.")], minimo=6.0),
    dict(id="c4_tiao_cai", cap=4, falas=[("A", None, "Até o dia em que o Tião tenta igual. Ele cai. Ele sente.")], sfx=[("queda", 0, -1.9)]),
    dict(id="c4_zefa", cap=4, falas=[("B", "zefa", "Acabou a brincadeira.")], pausa_antes=0.8, minimo=3.0, sfx=[("pau", 0, -0.6)]),
    dict(id="c4_final", cap=4, falas=[("A", None, "Mas nada te freia. Final do campeonato da rua. Você joga os dois tempos inteiros. Faz o gol. Dá a volta olímpica.")], sfx=[("torcida", 0, -2.6)]),
    dict(id="c4_manca", cap=4, falas=[("A", None, "Ninguém vê que você manca. Nem você.")], minimo=4.0),
    dict(id="c4_entrevista", cap=4, falas=[("B", "vizinho", "Menina que não cai! O que você sente?"), ("B", "gotinha", "Nada.")], gap=[0.5]),
    dict(id="c4_roxo", cap=4, falas=[("A", None, "À noite, na sua canela, um roxo do tamanho de uma mão. Você nem olha."), ("B", None, "Ela não olha porque nada avisou pra olhar.")]),
    # Capítulo 5: O preço
    dict(id="c5_panela", cap=5, falas=[("A", None, "A Vó Zefa pede a panela do fogo. Você pega sem pano.")], pausa_antes=0.6),
    dict(id="c5_mao", cap=5, falas=[("A", None, "Você sente que está quente. Nada manda soltar.")], minimo=4.0),
    dict(id="c5_larga", cap=5, falas=[("B", "lucia", "Larga!")], minimo=2.6),
    dict(id="c5_raiox", cap=5, falas=[("B", "helena", "Você quebrou o pé na final e continuou jogando. E essas duas aqui são antigas. Nunca doeram.")]),
    dict(id="c5_inimiga", cap=5, falas=[("B", "helena", "A dor não é sua inimiga. É a única que avisa.")], minimo=4.0),
    dict(id="c5_olho", cap=5, falas=[("A", None, "Tem mais. Você pisca pouco, porque nada incomoda. O olho seca sozinho. E cheiro: nenhum. A mesma peça que falta no nervo da dor falta no nariz.")]),
    dict(id="c5_fresco", cap=5, falas=[("A", None, "E tem o pior. O Tião torce o pé e chora."), ("B", "gotinha", "Que exagero."), ("A", None, "Você começa a achar todo mundo fresco.")]),
    # Capítulo 6: A noite do Tião
    dict(id="c6_muro", cap=6, falas=[("A", None, "Sábado à noite. O Tião sobe no muro pra fazer igual a Gotinha.")], pausa_antes=0.8),
    dict(id="c6_queda", cap=6, falas=[("A", None, "Escorrega. Grita. Você ri. Todo mundo exagera.")], sfx=[("queda", 0, 0.55)]),
    dict(id="c6_rostos", cap=6, falas=[("A", None, "Aí você vê a mãe dele correndo. Vê o rosto da sua mãe. Vê a Vó Zefa com a mão na boca.")]),
    dict(id="c6_para", cap=6, falas=[("A", None, "Você para de rir."), ("A", None, "Pela primeira vez, você sente a dor de alguém. Não no corpo. No rosto dos outros.")], gap=[1.0]),
    dict(id="c6_mao", cap=6, falas=[("A", None, "Você senta do lado dele. Segura a mão."), ("B", None, "Ela nunca vai sentir a dor dele. Mas aprendeu a ler.")], gap=[0.8]),
    # Capítulo 7: A pista
    dict(id="c7_lab", cap=7, falas=[("A", None, "Agora pense no que você prova.")], pausa_antes=0.8, minimo=3.0),
    dict(id="c7_alvo", cap=7, falas=[("A", None, "Existe uma comporta que, desligada, apaga a dor. E quem nasce sem ela segue inteiro: pensa, anda, sente todo o resto."), ("B", None, "Para quem fabrica remédio, isso é a descrição de um alvo perfeito.")]),
    dict(id="c7_2025", cap=7, falas=[("A", None, "Em janeiro de 2025, os Estados Unidos aprovaram o suzetrigine. O primeiro analgésico não opioide pra dor aguda. O primeiro remédio de dor realmente novo desde 1998. Ele não fecha a sua comporta. Fecha uma prima dela."), ("A", None, "A pista que abriu esse caminho veio de quem nasceu sem sentir.")], gap=[0.7]),
    dict(id="c7_hospital", cap=7, falas=[("A", None, "Naquela terça, nada doía. E hoje, em algum hospital, alguém acorda de uma cirurgia sem dor e sem opioide. Por causa de gente como você.")]),
    dict(id="c7_bike", cap=7, falas=[("B", None, "Que dor você deixaria de sentir?"), ("A", None, "E qual você não trocaria por nada?")], gap=[0.9], pausa_depois=1.5),
    dict(id="c7_inscreva", cap=7, falas=[], minimo=3.5),
]

VOZES = {
    "A": dict(voz="pt-BR-FranciscaNeural", rate="+10%", pitch="+0Hz"),
    "B": dict(voz="pt-BR-AntonioNeural", rate="-2%", pitch="+0Hz"),
}
# a voz B faz os personagens; o tom diferencia quem fala
PERSONAGEM = {
    "gotinha": dict(rate="+6%", pitch="+40Hz"),
    "tiao": dict(rate="+8%", pitch="+30Hz"),
    "caco": dict(rate="+12%", pitch="+16Hz"),
    "helena": dict(rate="-4%", pitch="+8Hz"),
    "lucia": dict(rate="+0%", pitch="+12Hz"),
    "zefa": dict(rate="-10%", pitch="+4Hz"),
    "vizinho": dict(rate="+14%", pitch="+0Hz"),
}
