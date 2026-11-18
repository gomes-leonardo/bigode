"""Roteiro completo do Téo ("E se você parasse de sentir dor?") estruturado por plano.

Cada plano: id, cap, falas [(voz, personagem, texto)]. A = narradora, B = personagens e comentários.
pausa_antes/pausa_depois: silêncio extra (s). sfx: (nome, índice da fala, deslocamento em s; negativo = antes do fim da fala).
minimo: duração mínima do plano (s). gap: pausa entre falas do plano. Sem travessão.
"""
PLANOS = [
    # 1. A terça em que nada doeu
    dict(id="c1_noite", cap=1, falas=[("A", None, "Naquela terça, nada doía em você. E era isso que estava errado.")], pausa_depois=0.4),
    dict(id="c1_quina", cap=1, falas=[("A", None, "Terça de manhã. Você levanta e enfia o dedinho do pé na quina da cama.")], sfx=[("toc", 0, -0.55)]),
    dict(id="c1_nada", cap=1, falas=[("A", None, "Nada.")], pausa_antes=0.3, minimo=2.2),
    dict(id="c1_pecinha", cap=1, falas=[("A", None, "Você pisa numa pecinha do seu irmão. Com força.")], sfx=[("clac", 0, -0.35)], pausa_depois=0.3),
    dict(id="c1_caco", cap=1, falas=[("B", "caco", "Isso aí é a coisa que mais dói no universo!")]),
    dict(id="c1_tira", cap=1, falas=[("A", None, "Nada de nada.")], minimo=3.6),
    dict(id="c1_rose", cap=1, falas=[("B", "rose", "Que barulheira é essa a essa hora?")]),
    dict(id="c1_quebrou", cap=1, falas=[("B", "caco", "Mãe, o Téo quebrou.")], pausa_depois=0.2),
    dict(id="c1_belisco", cap=1, falas=[("A", None, "Sua mãe aplica o teste oficial da casa.")], sfx=[("belisco", 0, -0.9), ("belisco", 0, 0.5)], pausa_depois=1.3),
    dict(id="c1_mao", cap=1, falas=[("B", "rose", "O beliscão tá funcionando. Você que não.")], pausa_antes=0.2, minimo=4.2),
    dict(id="c1_cartelas", cap=1, falas=[("A", None, "Você não sente mais dor. Nem pancada. Nem queimadura. Nem agulhada.")]),
    dict(id="c1_raro", cap=1, falas=[("A", None, "Tem gente que nasce assim. É raríssimo. Com você, foi de uma terça pra outra.")]),
    dict(id="c1_titulo", cap=1, falas=[("B", None, "E se você parasse de sentir dor?")], sfx=[("sino", 0, -2.6)], pausa_antes=0.4, minimo=4.0),
    # 2. Pra que serve a dor
    dict(id="c2_consulta", cap=2, falas=[("B", "rose", "Doutora, nem beliscão pega mais nesse menino.")]),
    dict(id="c2_algodao", cap=2, falas=[("B", "helena", "Sente?"), ("B", "teo", "Sinto. Faz cócega.")], gap=[0.5]),
    dict(id="c2_caneta", cap=2, falas=[("B", "helena", "E agora?"), ("B", "teo", "Sinto que apertou."), ("A", None, "O tato, perfeito. A dor, zero.")], gap=[0.6, 0.4]),
    dict(id="c2_alarme", cap=2, falas=[("A", None, "A dor é um alarme. Você se machuca, o nervo manda o recado, o cérebro toca a sirene.")], sfx=[("sirene", 0, -1.3)], pausa_depois=0.4),
    dict(id="c2_mapa", cap=2, falas=[("A", None, "Em três famílias do Paquistão, quem nasceu assim tinha o mesmo gene quebrado. Esse gene é a receita de uma peça do nervo da dor.")]),
    dict(id="c2_interfone", cap=2, falas=[("B", None, "Quebrou a peça, é interfone com o fio cortado. Aperta, aperta. Ninguém atende.")], pausa_depois=0.6),
    dict(id="c2_curativo", cap=2, falas=[("A", None, "Sem alarme, o machucado chega sem avisar.")], pausa_depois=0.3),
    dict(id="c2_branca", cap=2, falas=[("A", None, "Sua mãe fica branca."), ("B", "teo", "Posso ir no campinho?")], gap=[0.8], pausa_depois=0.4),
    # 3. Uma vida sem dor
    dict(id="c3_fila", cap=3, falas=[("A", None, "Dia de vacina na escola. A fila inteira tremendo. Menos você.")]),
    dict(id="c3_vacina", cap=3, falas=[("B", "teo", "Pode pôr outra? Eu nem vi.")], pausa_antes=0.2, minimo=3.6),
    dict(id="c3_adesivo", cap=3, falas=[("A", None, "Você ganha o adesivo de corajoso sem fazer força nenhuma.")]),
    dict(id="c3_venda", cap=3, falas=[("A", None, "Na venda do Seu Nelson, o desafio da pimenta.")]),
    dict(id="c3_leite", cap=3, falas=[("B", "nelson", "Leite, menino! Água piora!")], minimo=3.0),
    dict(id="c3_pimenta", cap=3, falas=[("A", None, "Você come uma inteira. E outra. E pergunta se tem farofa.")], pausa_depois=0.5),
    dict(id="c3_nervo", cap=3, falas=[("B", None, "A pimenta arde porque liga os mesmos nervos que avisam calor. Os seus não atendem o telefone.")]),
    dict(id="c3_bolada", cap=3, falas=[("A", None, "No campinho, o Dudu chuta de bico. A bola para na sua cara.")], sfx=[("bola", 0, -0.75)]),
    dict(id="c3_doeu", cap=3, falas=[("B", "dudu", "Não doeu?"), ("B", "teo", "Doeu o quê?")], pausa_antes=1.0, gap=[0.5]),
    dict(id="c3_gravando", cap=3, falas=[("B", "caco", "Pera, tô gravando. Faz de novo.")], pausa_depois=0.3),
    # 4. O menino de pedra
    dict(id="c4_viral", cap=4, falas=[("A", None, "O vídeo viraliza. Te batizam de o menino de pedra.")], sfx=[("plim", 0, 0.2)], pausa_depois=0.6),
    dict(id="c4_montagem", cap=4, falas=[("A", None, "Cada vídeo, mais views. E mais burrice.")], minimo=6.3),
    dict(id="c4_dudu", cap=4, falas=[("A", None, "Até o Dudu tentar igual. Você levanta rindo. Ele não.")], sfx=[("trave", 0, 1.3)], pausa_depois=0.4),
    dict(id="c4_vo", cap=4, falas=[("B", "cida", "Acabou a gravação.")], sfx=[("pau", 0, -0.2)], pausa_antes=0.6, minimo=3.2),
    dict(id="c4_final", cap=4, falas=[("A", None, "Mas nada te segura. O time do bairro chega na final. E você vai pro gol.")], sfx=[("torcida", 0, 0.0)]),
    dict(id="c4_defesa", cap=4, falas=[("B", "radio", "Chutou! Defendeu com a cara! E tá rindo, minha gente!")], sfx=[("bola", 0, 0.75)]),
    dict(id="c4_trave", cap=4, falas=[("A", None, "Contra a trave. E levanta como se nada tivesse acontecido.")], sfx=[("trave", 0, 0.45)]),
    dict(id="c4_campeao", cap=4, falas=[("B", "torcida", "É campeão!"), ("A", None, "Ninguém vê que você está mancando. Nem você.")], sfx=[("torcida", 0, 0.0)], gap=[0.8]),
    dict(id="c4_reporter", cap=4, falas=[("B", "vizinho", "Menino de pedra! Conta pra gente: o que você sente?"), ("B", "teo", "Nada.")], gap=[0.7]),
    dict(id="c4_roxo", cap=4, falas=[("A", None, "Naquela noite, tem um roxo enorme na sua perna. Você nem olha."), ("B", None, "Ele não olha porque nada mandou olhar.")], gap=[0.6], pausa_depois=0.5),
    # 5. O preço
    dict(id="c5_panela", cap=5, falas=[("B", "cida", "Téo, tira a panela do fogo pra vó.")]),
    dict(id="c5_alca", cap=5, falas=[("A", None, "Você pega sem pano. Sente que está quente. Mas nada em você manda soltar.")], sfx=[("vapor", 0, 0.1)]),
    dict(id="c5_vo", cap=5, falas=[("A", None, "Sua mão.")], sfx=[("prato", 0, -2.4)], pausa_antes=1.8, minimo=4.6),
    dict(id="c5_raiox", cap=5, falas=[("B", "helena", "Você quebrou o pé na final e continuou jogando.")]),
    dict(id="c5_antigas", cap=5, falas=[("B", "helena", "E essas duas são antigas. Nunca doeram. A dor não é sua inimiga, Téo. Ela é o único que avisa.")]),
    dict(id="c5_rua", cap=5, falas=[("A", None, "No dia seguinte, o Dudu torce o pé e chora."), ("B", "teo", "Isso nem é nada. Levanta.")], gap=[0.8]),
    dict(id="c5_fresco", cap=5, falas=[("A", None, "Você já não entende por que os outros reclamam tanto. E começa a achar que todo mundo é fresco.")], pausa_depois=0.6),
    # 6. A noite do muro
    dict(id="c6_muro", cap=6, falas=[("A", None, "Sábado à noite. O Dudu sobe no muro pra fazer igual o menino de pedra.")]),
    dict(id="c6_cai", cap=6, falas=[("A", None, "Escorrega. Grita. Você ri. Todo mundo exagera.")], sfx=[("queda", 0, 0.9)]),
    dict(id="c6_rostos", cap=6, falas=[("A", None, "Aí você vê a mãe dele correndo. Vê o rosto da sua mãe. Vê a Vó Cida largar a colher de pau.")], sfx=[("pau", 0, -0.3)]),
    dict(id="c6_para", cap=6, falas=[("A", None, "Você para de rir.")], pausa_antes=0.5, minimo=3.4),
    dict(id="c6_mao", cap=6, falas=[("A", None, "Pela primeira vez, você sente a dor de alguém. Não na sua perna. No rosto dos outros.")]),
    dict(id="c6_ambulancia", cap=6, falas=[("B", "dudu", "Dói pra caramba, Téo."), ("B", "teo", "Eu sei. Agora eu sei.")], sfx=[("ambulancia", 0, 0.0)], gap=[1.0], pausa_antes=0.5),
    dict(id="c6_abraco", cap=6, falas=[("A", None, "Sua mãe te abraça. A única coisa que dói em você é ver o Dudu assim.")], pausa_depois=0.6),
    # 7. As mãos da vó
    dict(id="c7_cozinha", cap=7, falas=[], sfx=[("sino", None, 0.2)], minimo=3.0),
    dict(id="c7_maos", cap=7, falas=[("A", None, "Na mesa da cozinha, as mãos da sua avó. Cheias de marcas de queimadura. Antigas.")]),
    dict(id="c7_vira", cap=7, falas=[("B", "cida", "Eu também não sinto, Téo. Nunca senti.")], pausa_antes=0.4),
    dict(id="c7_gene", cap=7, falas=[("A", None, "O gene quebrado vem de família. A sua avó passou setenta anos sem alarme nenhum. Escondendo.")]),
    dict(id="c7_canela", cap=7, falas=[("B", "cida", "Então agora você aprende comigo. Toda noite, você olha o corpo inteiro. Porque ninguém vai avisar.")]),
    dict(id="c7_lanterna", cap=7, falas=[("A", None, "Naquela terça, nada doía em você. E a sua avó já sabia.")], pausa_antes=0.4, pausa_depois=0.6),
    dict(id="c7_final", cap=7, falas=[("B", None, "Que dor você deixaria de sentir?"), ("A", None, "E qual você não trocaria por nada?"), ("B", None, "Se inscreve.")], gap=[0.6, 0.8], minimo=8.0),
]

VOZES = {
    "A": dict(voz="pt-BR-FranciscaNeural", rate="+10%", pitch="+0Hz"),
    "B": dict(voz="pt-BR-AntonioNeural", rate="-2%", pitch="+0Hz"),
}
# a voz B faz os personagens; o tom diferencia quem fala (provisório, a voz final vem do ElevenLabs)
PERSONAGEM = {
    "teo": dict(rate="+6%", pitch="+38Hz"),
    "dudu": dict(rate="+8%", pitch="+30Hz"),
    "caco": dict(rate="+12%", pitch="+16Hz"),
    "rose": dict(rate="+4%", pitch="+12Hz"),
    "cida": dict(rate="-10%", pitch="+4Hz"),
    "helena": dict(rate="-4%", pitch="+8Hz"),
    "nelson": dict(rate="+10%", pitch="-6Hz"),
    "vizinho": dict(rate="+14%", pitch="+0Hz"),
    "radio": dict(rate="+24%", pitch="+6Hz"),
    "torcida": dict(rate="+10%", pitch="+20Hz"),
}
